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
        <div v-if="!isWarning && !isWatch">
          <br/>
          <h4>{{headline}}</h4>
          <p>{{description}}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'HelloWorld',
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
      ]
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
        return "No.";
      }
    }
  },
  methods: {
    getLoadingMessage: function() {
      let rand = Math.floor(Math.random() * this.loadingMessages.length);
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
            this.isLoading = false;
          } else {
            axios.get('https://api.weather.gov/alerts?event=Tornado Watcg&active=true&point=' + lat + ',' + long)
              .then((res) => {
                if(res.data && res.data.features && res.data.features.length > 0) {
                  this.isWarning = false;
                  this.isWatch = true;
                  this.headline = res.data.features[0].properties.headline;
                  this.description = res.data.features[0].properties.description;
                }
              })
              .catch(err => {
                this.error = true;
                console.error(err);
              })
              .finally(() => {
                this.isLoading = false;
              })
          }
        })
      .catch(err => {
        this.error = true;
        console.error(err);
      });
    }
  },
  mounted() {
    let long = -101.51;
    let lat = 33.04;

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

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
