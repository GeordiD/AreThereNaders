<template>
  <div v-if="setupCorrectly">
    <font-awesome-icon 
         icon="comment" 
         size="lg" 
         class="pointer"
         :style="{ color: color }" 
         v-on:click="showModal()"
         data-toggle="tooltip"
         title="Send Feedback"
         ></font-awesome-icon>

    <modal name="modalSendFeedback" height="auto" :scrollable="true" @before-close="modalCleanup">
      <div class="gmodal">
        <h3>Send Feedback</h3>
        <div id="form" v-if="submitStatus.substring(0,4) === 'FILL'">
          <p>{{modalText}}</p>
          <form class="container-fluid">
            <div class="form-group row">
              <input
                type="text"
                class="form-control font-weight-bold"
                id="fbInputSubject"
                placeholder="Subject"
                v-model="$v.subject.$model"
                :class="{ 'input-error': $v.subject.$error}"
              />
            </div>
            <div class="form-group row">
              <input
                type="text"
                class="form-control"
                id="fbInputEmail"
                placeholder="Email Address"
                v-model="$v.email.$model"
                :class="{ 'input-error': $v.email.$error}"
              />
            </div>
            <div class="form-group row">
              <textarea
                class="form-control"
                id="fbInputBody"
                placeholder="What's up?"
                rows="4"
                v-model="$v.body.$model"
                :class="{ 'input-error': $v.body.$error}"
              />
            </div>
          </form>
          <div class="footer">
            <div
              class="alert alert-danger mt-3"
              v-if="submitStatus === 'FILL-ERROR'"
            >Please correctly complete all fields before submitting</div>

            <button class="btn btn-primary mr-2" v-on:click="modalSubmit()">Submit</button>
            <button class="btn btn-secondary ml-2" v-on:click="modalClose()">Close</button>
          </div>
        </div>
        <div v-else-if="submitStatus.substring(0,4) === 'SEND'">
          <p v-if="submitStatus === 'SEND-ERROR'">
            Sorry, something went wrong while sending the email.  Please try again.
          </p>
          <p v-else>
            Email sent successfully.
          </p>
          <div class="footer">
            <button class="btn btn-secondary ml-2" v-on:click="modalClose()">Close</button>
          </div>
        </div>
        <div v-else>
          <div
            class="spinner-border my-4"
            style="width: 3rem; height: 3rem;"
            :style="{ color: color }"
            role="status"
          >
            <span class="sr-only">Submitting...</span>
          </div>
        </div>
      </div>
    </modal>
  </div>
</template>

<script>
import Vue from "vue";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faComment } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { required, email } from "vuelidate/lib/validators";
import { validationMixin } from "vuelidate";
import emailjs from "emailjs-com";
import VModal from "vue-js-modal";

library.add(faComment);

Vue.use(VModal);

export default {
  name: "SendFeedback",
  components: {
    FontAwesomeIcon
  },
  mixins: [validationMixin],
  data() {
    return {
      packageName: "G-Feedback",
      setupCorrectly: true,

      defaultDesc:
        "Got some feedback you'd like to share? We'll get back to you as quickly as possible!",

      submitStatus: "FILL-GOOD",

      subject: "",
      email: "",
      body: ""
    };
  },
  props: ["color", "description", "email-config"],
  computed: {
    modalText() {
      return this.description ? this.description : this.defaultDesc;
    }
  },
  validations: {
    subject: {
      required
    },
    email: {
      required,
      email
    },
    body: {
      required
    }
  },
  mounted() {
    if (!this.emailConfig) {
      this.complain("'emailConfig' is a required parameter!");
    } else {
      if (!this.emailConfig.userId) {
        this.complain(
          "'emailConfig' must have 'userId' as a parameter"
        );
      }
      if (!this.emailConfig.siteName) {
        this.complain(
          "'emailConfig' must have 'siteName' as a parameter"
        );
      }
    }
  },
  methods: {
    showModal() {
      this.$modal.show("modalSendFeedback");
    },
    modalSubmit() {
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.submitStatus = "FILL-ERROR";
      } else {
        this.submitStatus = "PENDING";
        this.sendEmail();
      }
    },
    modalClose() {
      this.$modal.hide("modalSendFeedback");
    },
    modalCleanup() {
      this.submitStatus = "FILL-GOOD";
      this.subject = "";
      this.email = "";
      this.body = "";
      this.$v.$reset();
    },
    sendEmail() {
      let params = {
        site_name: this.emailConfig.siteName,
        from_email: this.email,
        subject: this.subject,
        body: this.body
      };
      let service_id = "default_service";
      let template_id = "template_tiDmF9tn";

      emailjs.send(service_id, template_id, params, this.emailConfig.userId)
        .then(() => {
          this.submitStatus = "SEND-SUCCESS";
        })
        .catch((err) => {
          console.error(err);
          this.submitStatus = "SEND-ERROR";
        })
    },
    complain(text) {
      console.error(this.packageName + ": " + text);
      this.setupCorrectly = false;
    }
  }
};
</script>

<style>
.gmodal {
  padding: 10px;
}

.input-error {
  border-color: red;
  background-color: rgb(255, 223, 222);
}

.pointer {cursor: pointer;}
</style>