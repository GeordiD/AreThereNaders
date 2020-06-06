<template>
  <form @submit.prevent="onSubmit" class="container-fluid mx-auto my-3">
    <p>Skynet is busy and can't locate you, we'll have to do this the old fashioned way...</p>
    <div v-if="submitStatus === 'PENDING'">
        <div class="spinner-border" role="status">
            <span class="sr-only">Loading...</span>
        </div>
    </div>
    <div v-else>
      <div class="form-group row">
        <input
          type="text"
          class="form-control col-sm-12 mx-3 mx-sm-0"
          :class="{ 'input-error': $v.street.$error}"
          id="street"
          placeholder="Street Address"
          v-model="$v.street.$model"
        />
      </div>
      <div class="form-group row">
        <input
          type="text"
          class="form-control col-sm-7 mx-3 mx-sm-0"
          :class="{ 'input-error': $v.city.$error}"
          id="city"
          placeholder="City"
          v-model="$v.city.$model"
        />
        <div class="col-sm-2 my-3 my-sm-0">
          <select
            class="form-control"
            :class="{ 'input-error': $v.state.$error}"
            id="state"
            v-model="$v.state.$model"
          >
            <option value="" disabled>State</option>
            <option value="AL">AL</option>
            <option value="AK">AK</option>
            <option value="AR">AR</option>
            <option value="AZ">AZ</option>
            <option value="CA">CA</option>
            <option value="CO">CO</option>
            <option value="CT">CT</option>
            <option value="DC">DC</option>
            <option value="DE">DE</option>
            <option value="FL">FL</option>
            <option value="GA">GA</option>
            <option value="HI">HI</option>
            <option value="IA">IA</option>
            <option value="ID">ID</option>
            <option value="IL">IL</option>
            <option value="IN">IN</option>
            <option value="KS">KS</option>
            <option value="KY">KY</option>
            <option value="LA">LA</option>
            <option value="MA">MA</option>
            <option value="MD">MD</option>
            <option value="ME">ME</option>
            <option value="MI">MI</option>
            <option value="MN">MN</option>
            <option value="MO">MO</option>
            <option value="MS">MS</option>
            <option value="MT">MT</option>
            <option value="NC">NC</option>
            <option value="NE">NE</option>
            <option value="NH">NH</option>
            <option value="NJ">NJ</option>
            <option value="NM">NM</option>
            <option value="NV">NV</option>
            <option value="NY">NY</option>
            <option value="ND">ND</option>
            <option value="OH">OH</option>
            <option value="OK">OK</option>
            <option value="OR">OR</option>
            <option value="PA">PA</option>
            <option value="RI">RI</option>
            <option value="SC">SC</option>
            <option value="SD">SD</option>
            <option value="TN">TN</option>
            <option value="TX">TX</option>
            <option value="UT">UT</option>
            <option value="VT">VT</option>
            <option value="VA">VA</option>
            <option value="WA">WA</option>
            <option value="WI">WI</option>
            <option value="WV">WV</option>
            <option value="WY">WY</option>
          </select>
        </div>
        <input
          type="text"
          pattern="\d*"
          maxlength="5"
          class="form-control col-sm-3 mx-3 mx-sm-0"
          :class="{ 'input-error': $v.zip.$error}"
          id="zip"
          placeholder="Zip Code"
          @keypress="isNumber($event)"
          v-model="$v.zip.$model"
        />
      </div>
      <div class="form-group row">
        <button
          type="submit"
          class="btn btn-primary mx-auto"
          :disabled="submitStatus === 'PENDING'"
        >But are there 'naders?</button>
        <div
          class="alert alert-danger mt-3"
          v-if="submitStatus === 'ERROR'"
        >Ope, looks like you didn't fill out this form right. Any chance I can get you to take a second look?</div>
        <div
          class="alert alert-primary mt-3"
          v-if="submitStatus === 'BAD'"
        >Hmmm, I couldn't figure out where that is. You might try again, and if you still have problems reach out!</div>
      </div>
    </div>
  </form>
</template>

<script>
import * as opencage from "opencage-api-client";
import { required, minLength, maxLength } from "vuelidate/lib/validators";
import { validationMixin } from "vuelidate";

export default {
  name: "GeocodingForm",
  mixins: [validationMixin],
  data() {
    return {
      apiKey: process.env.VUE_APP_OPENCAGE,
      isLoading: true,
      isError: false,
      submitStatus: null,

      street: "",
      city: "",
      state: "",
      zip: null
    };
  },
  validations: {
    street: {
      required
    },
    city: {
      required
    },
    state: {
      required
    },
    zip: {
      required,
      minLength: minLength(5),
      maxLength: maxLength(5)
    }
  },
  methods: {
    onSubmit() {
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.submitStatus = "ERROR";
      } else {
        this.submitStatus = "PENDING";
        this.geocode();
      }
    },

    geocode() {
      let query =
        this.street.trim() +
          " " +
          this.city.trim() +
          " " +
          this.state.trim() +
          " " +
          this.zip.trim();

      opencage
        .geocode({ key: this.apiKey, q: query })
        .then(response => {
          if(response && response.results && response.results.length > 0 && response.results[0].bounds && response.results[0].bounds.northeast) {
              let pos = response.results[0].bounds.northeast;
              this.submitStatus = 'GOOD';

              this.$ga.event({
                eventCategory: 'geocode',
                eventAction: 'good',
                eventValue: 'good'
              });

              this.$emit('long-lat', pos.lng, pos.lat, response.results[0].formatted);
          } else {
              this.submitStatus = 'BAD';

              this.$ga.event({
                eventCategory: 'geocode',
                eventAction: 'bad',
                eventValue: 'bad'
              });
          }
        })
        .catch(err => {
          console.error(err);
          this.submitStatus = "BAD";

          this.$ga.event({
                eventCategory: 'geocode',
                eventAction: 'error',
                eventValue: 'error'
              });
        });
    },
    isNumber(evt) {
      evt = evt ? evt : window.event;
      var charCode = evt.which ? evt.which : evt.keyCode;
      if (
        charCode > 31 &&
        (charCode < 48 || charCode > 57) &&
        charCode !== 46
      ) {
        evt.preventDefault();
      } else {
        return true;
      }
    }
  }
};
</script>

<style scoped>
form {
  max-width: 750px;
}

.input-error {
  border-color: red;
  background-color: rgb(255, 223, 222);
}
</style>