<template>
  <div>
    <div v-if="error">
      <div v-if="geolocationError">
        Right now, this only works if you share your location.
      </div>
      <div v-else>
        Well, something broke. I'll try and fix it hang tight.
      </div>
    </div>
    <div v-else-if="isLoading">
       {{getLoadingMessage()}}
    </div>
    <div v-else> 
      <div id="are-there" >
        <h1>{{areThere}}</h1>
        <div>
          <div v-if="headline">
            <br/>
            <h4 >{{headline}}</h4>
          </div>
          <p>{{description}}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'AreThereNaders',
  data() {
    return {
      isWarning: false,
      isWatch: false,
      headline: null,
      description: null,
      error: false,
      geolocationError: false,
      isLoading: true,
      loadingMessages: [
        'Hacking NASA',
        'Polling the guvment',
        'Reading the Scrying Stones',
        'Licking finger, holding it up to the sky, and waiting',
        'Just a sec, lemme check from my porch',
        'Smelling the air',
        'Making you wait for no reason, suspense is fun',
        'Calling memaw',
        'Burning my essential oils',
        'Reading the tarrot cards'
      ],
      startTime: null,
      waitTime: 750 // ms
    }
  },
  computed: {
    areThere: function() {
      if (this.isWarning) {
        return "Yes.";
      } 
      else if (this.isWatch) {
        return "Maybe.";
      }
      else {
        return "Nope.";
      }
    }
  },
  methods: {
    getLoadingMessage: function() {
      let rand = Math.floor(Math.random() * this.loadingMessages.length);
      console.log(process.env.VUE_APP_OPENCAGE);
      return this.loadingMessages[rand];
    },
    
    checkIfNaders(long, lat) {
      axios.get('https://api.weather.gov/alerts?event=Tornado Warning&active=true&point=' + lat + ',' + long)
      .then((res) => {
          if(res.data && res.data.features && res.data.features.length > 0) {
            this.isWarning = true;
            this.isWatch = false;
            this.headline = res.data.features[0].properties.headline;
            this.description = res.data.features[0].properties.description;
            this.doneLoading();
          } else {
            axios.get('https://api.weather.gov/alerts?event=Tornado Watcg&active=true&point=' + lat + ',' + long)
              .then((res) => {
                if(res.data && res.data.features && res.data.features.length > 0) {
                  this.isWarning = false;
                  this.isWatch = true;
                  this.headline = res.data.features[0].properties.headline;
                  this.description = res.data.features[0].properties.description;
                } else {
                  this.description = 'No tornados in your area.'
                }
              })
              .catch(err => {
                this.error = true;
                console.error(err);
              })
              .finally(() => {
                this.doneLoading();
              })
          }
        })
      .catch(err => {
        this.error = true;
        console.error(err);
      });
    },

    doneLoading() {
      let elapsedTime = new Date().getTime() - this.startTime;
      
      if(this.waitTime > elapsedTime) {
        setTimeout(() => { this.isLoading = false }, this.waitTime - elapsedTime);
      } else {
        this.isLoading = false;
      }

    }
  },
  mounted() {
    let long = -101.51;
    let lat = 33.04;
    this.startTime = new Date().getTime();

    if(navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          long = position.coords.longitude;
          lat = position.coords.latitude;
          console.log(lat + "," + long);
          this.checkIfNaders(long, lat);
        },
        () => {
          // we'll have to get it some other way
          this.error = this.geolocationError = true;
        }
      )
    }
  }
}
</script>

<style scoped>

h1 {
  font-size: 50px;
}

</style>
