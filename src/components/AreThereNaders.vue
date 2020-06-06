<template>
  <div class="page-container">
    <div class="pt-3 page-content">
      <div v-if="error">Well, something broke. I'll try and fix it hang tight.</div>
      <div v-else-if="isLoading">{{loadingMessage}}</div>
      <div v-else>
        <div id="are-there" v-if="hasLongLat">
          <h1>{{areThere}}</h1>
          <div>
            <div v-if="headline">
              <br />
              <h4>{{headline}}</h4>
            </div>
            <p>{{description}}</p>
          </div>
        </div>
        <div v-else>
          <h1>Enter Address</h1>
          <GeocodingForm v-on:long-lat="getLongLat" />
        </div>
      </div>
    </div>
    <div class="footer" v-if="formattedAddress && !isLoading">
      <div>
        Using address: <span v-if="!isWatch">tessstttt4 </span>
        <b>{{formattedAddress}}</b>
        <br />
        <i>
          Not your address?
          <a href="#" v-on:click="resetAddress()">
            <span v-if="allowGeolocation">Try entering it manually</span>
            <span v-else>Try entering it again</span>
          </a>
          <span v-if="allowGeolocation && !usingGeolocation">
             - 
            <a href="#" v-on:click="pullGeolocation()">Find me</a>
          </span>
        </i>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import GeocodingForm from "./GeocodingForm.vue";
import * as opencage from "opencage-api-client";

export default {
  name: "AreThereNaders",
  components: {
    GeocodingForm
  },
  data() {
    return {
      isWarning: false,
      isWatch: false,
      headline: null,
      description: null,
      formattedAddress: null,
      error: false,
      allowGeolocation: true,
      usingGeolocation: true,
      hasLongLat: true,
      isLoading: true,
      loadingMessage: "loading...",
      loadingMessages: [
        "Hacking NASA",
        "Polling the guvment",
        "Reading the Scrying Stones",
        "Licking finger, holding it up to the sky, and waiting",
        "Just a sec, lemme check from my porch",
        "Smelling the air",
        "Making you wait for no reason, suspense is fun",
        "Calling memaw",
        "Burning my essential oils",
        "Reading the tarrot cards"
      ],
      startTime: null,
      waitTime: 750 // ms
    };
  },
  computed: {
    areThere: function() {
      if (this.isWarning) {
        return "Yes.";
      } else if (this.isWatch) {
        return "Maybe.";
      } else {
        return "Nope.";
      }
    }
  },
  mounted() {
      this.pullGeolocation();
  },
  methods: {
    pullGeolocation() {
      let long = 0;
      let lat = 0;
      this.startTime = new Date();

      this.isLoading = true;
      this.getLoadingMessage();

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          position => {
            this.$ga.event({
              eventCategory: "geolocation",
              eventAction: "usingGeolocation",
              eventValue: "usingGeolocation"
            });

            long = position.coords.longitude;
            lat = position.coords.latitude;
            // this.usingGeolocation = true;
            // this.allowGeolocation = true;

            this.reverseGeocode(long, lat);
            this.checkIfNaders(long, lat);
          },
          () => {
            // we'll have to get it some other way
            this.usingGeolocation = this.allowGeolocation = this.hasLongLat = false;
            this.isLoading = false;

            this.$ga.event({
              eventCategory: "geolocation",
              eventAction: "notUsingGeoLocation",
              eventValue: "notUsingGeoLocation"
            });
          }
        );
      }
    },
    resetAddress() {
      this.hasLongLat = false;
      this.formattedAddress = null;
    },

    getLongLat(long, lat, forAddress) {
      this.getLoadingMessage();
      this.isLoading = true;
      this.usingGeolocation = false;
      this.hasLongLat = true;
      this.formattedAddress = forAddress;
      this.checkIfNaders(long, lat);
    },

    getLoadingMessage() {
      let rand = Math.floor(Math.random() * this.loadingMessages.length);
      this.loadingMessage = this.loadingMessages[rand];
    },

    checkIfNaders(long, lat) {
      axios
        .get(
          "https://api.weather.gov/alerts?event=Tornado Warning&active=true&point=" +
            lat +
            "," +
            long
        )
        .then(res => {
          if (res.data && res.data.features && res.data.features.length > 0) {
            this.isWarning = true;
            this.isWatch = false;
            this.headline = res.data.features[0].properties.headline;
            this.description = res.data.features[0].properties.description;
            this.doneLoading();

            this.$ga.event({
              eventCategory: "results",
              eventAction: "warning",
              eventValue: "warning"
            });
          } else {
            axios
              .get(
                "https://api.weather.gov/alerts?event=Tornado Watcg&active=true&point=" +
                  lat +
                  "," +
                  long
              )
              .then(res => {
                if (
                  res.data &&
                  res.data.features &&
                  res.data.features.length > 0
                ) {
                  this.isWarning = false;
                  this.isWatch = true;
                  this.headline = res.data.features[0].properties.headline;
                  this.description =
                    res.data.features[0].properties.description;

                  this.$ga.event({
                    eventCategory: "results",
                    eventAction: "watch",
                    eventValue: "watch"
                  });
                } else {
                  this.description = "No tornados in your area.";

                  this.$ga.event({
                    eventCategory: "results",
                    eventAction: "no tornado",
                    eventValue: "no tornado"
                  });
                }
              })
              .catch(err => {
                this.error = true;
                console.error(err);
              })
              .finally(() => {
                this.doneLoading();
              });
          }
        })
        .catch(err => {
          this.error = true;
          console.error(err);
        });
    },

    reverseGeocode(long, lat) {
      let apiKey = process.env.VUE_APP_OPENCAGE;
      let query = encodeURI(lat + "+" + long);

      axios.get(`https://api.opencagedata.com/geocode/v1/json?key=${apiKey}&q=${query}`)
        .then((response) => {
          response = response.data;
          if(response && response.results && response.results.length > 0 && response.results[0].formatted) {
              this.formattedAddress = response.results[0].formatted;

              this.$ga.event({
                eventCategory: 'reverseGeocode',
                eventAction: 'good',
                eventValue: 'good'
              });

              
          } else {
              console.error("Couldn't get reverseGeocoding");

              this.$ga.event({
                eventCategory: 'reverseGeocode',
                eventAction: 'bad',
                eventValue: 'bad'
              });
          }
        })
    },

    doneLoading() {
      let elapsedTime = new Date().getTime() - this.startTime;

      if (this.waitTime > elapsedTime) {
        setTimeout(() => {
          this.isLoading = false;
        }, this.waitTime - elapsedTime);
      } else {
        this.isLoading = false;
      }
    }
  }
};
</script>

<style scoped>
h1 {
  font-size: 75px;
}

.page-container {
  position: relative;
  min-height: 100vh;
}

.page-content {
  padding-bottom: 5rem;
}

.footer {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 5rem;
}
</style>
