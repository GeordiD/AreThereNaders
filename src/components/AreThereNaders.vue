<template>
  <div class="page-container">
    <div class="pt-3 page-content">
      <div v-if="error">Well, something broke. I'll try and fix it hang tight.</div>
      <div v-else-if="isLoading">{{getLoadingMessage()}}</div>
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
    <div class="footer" v-if="formattedAddress">
      <div>
        Using address:
        <b>{{formattedAddress}}</b>
        <br />
        <i>
          Not your address?
          <a href="#" v-on:click='resetAddress()'>Try entering it again</a>
        </i>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import GeocodingForm from "./GeocodingForm.vue";

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
      hasLongLat: true,
      isLoading: true,
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
    let long = -101.51;
    let lat = 33.04;
    this.startTime = new Date().getTime();

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          long = position.coords.longitude;
          lat = position.coords.latitude;
          console.log(lat + "," + long);
          this.checkIfNaders(long, lat);
        },
        () => {
          // we'll have to get it some other way
          this.hasLongLat = false;
          this.isLoading = false;
        }
      );
    }
  },
  methods: {
    resetAddress() {
      this.hasLongLat = false;
      this.formattedAddress = null;
    },
    getLongLat(long, lat, forAddress) {
      this.isLoading = true;
      this.hasLongLat = true;
      this.formattedAddress = forAddress;
      this.checkIfNaders(long, lat);
    },

    getLoadingMessage() {
      let rand = Math.floor(Math.random() * this.loadingMessages.length);
      return this.loadingMessages[rand];
    },

    checkIfNaders(long, lat) {
      console.log("check if naders: " + long + ", " + lat);
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
                } else {
                  this.description = "No tornados in your area.";
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
