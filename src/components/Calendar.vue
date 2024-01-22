<template>
  <v-row class="rounded-xl grey darken-3" dark>
    <v-col>
      <v-sheet height="64" class="rounded-xl grey darken-3" dark>
        <v-toolbar flat class="rounded-xl grey darken-2" dark>
          <v-btn dark class="mr-4 green accent-3" @click="dialog = true">
            Agregar
          </v-btn>
          <v-btn outlined class="mr-4" @click="setToday"> Hoy </v-btn>
          <v-btn fab text small @click="prev">
            <v-icon small>fa-solid fa-arrow-left</v-icon>
          </v-btn>
          <v-btn fab text small @click="next">
            <v-icon small>fa-solid fa-arrow-right</v-icon>
          </v-btn>
          <v-toolbar-title>{{ title }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-menu bottom right dark>
            <template v-slot:activator="{ on }">
              <v-btn outlined v-on="on">
                <span>{{ typeToLabel[type] }}</span>
                <v-icon right>fa-solid fa-caret-down</v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item @click="type = 'day'">
                <v-list-item-title>Día</v-list-item-title>
              </v-list-item>
              <v-list-item @click="type = 'week'">
                <v-list-item-title>Semana</v-list-item-title>
              </v-list-item>
              <v-list-item @click="type = 'month'">
                <v-list-item-title>Mes</v-list-item-title>
              </v-list-item>
              <v-list-item @click="type = '4day'">
                <v-list-item-title>4 días</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-toolbar>
      </v-sheet>
      <v-sheet height="600" class="rounded-xl grey darken-3" dark>
        <v-calendar
          ref="calendar"
          v-model="focus"
          color="primary"
          :events="events"
          :event-color="getEventColor"
          :event-margin-bottom="3"
          :now="today"
          :type="type"
          @click:event="showEvent"
          @click:more="viewDay"
          @click:date="viewDay"
          @change="updateRange"
          :weekdays="[1, 2, 3, 4, 5, 6, 0]"
          locale="es"
          :short-weekdays="false"
          class="rounded-xl grey darken-3"
          dark
        ></v-calendar>

        <!-- Modal Agregar Evento -->
        <v-dialog v-model="dialog" dark>
          <v-card>
            <v-container>
              <v-form @submit.prevent="addEvent">
                <v-text-field type="text" label="Agregar Nombre" v-model="name">
                </v-text-field>
                <v-text-field
                  type="text"
                  label="Agregar un Detalle"
                  v-model="details"
                >
                </v-text-field>
                <v-text-field
                  type="date"
                  label="Inicio del evento"
                  v-model="start"
                >
                </v-text-field>
                <v-text-field type="date" label="Fin del evento" v-model="end">
                </v-text-field>
                <v-text-field
                  type="color"
                  label="Color del evento"
                  v-model="color"
                >
                </v-text-field>
                <v-btn
                  type="submit"
                  class="mr-4 green accent-3"
                  dark
                  @click.stop="dialog = false"
                  >Agregar</v-btn
                >
              </v-form>
            </v-container>
          </v-card>
        </v-dialog>

        <v-menu
          v-model="selectedOpen"
          :close-on-content-click="false"
          :activator="selectedElement"
          offset-x
          dark
        >
          <v-card min-width="350px" flat>
            <v-toolbar :color="selectedEvent.color" dark>
              <v-btn icon @click="deleteEvent(selectedEvent)">
                <v-icon>fa-solid fa-trash</v-icon>
              </v-btn>
              <v-toolbar-title>{{ selectedEvent.name }}</v-toolbar-title>
              <v-spacer></v-spacer>
            </v-toolbar>

            <v-card-text>
              <v-form v-if="currentlyEditing !== selectedEvent.id">
                {{ selectedEvent.details }}
              </v-form>

              <v-form v-else>
                <v-text-field
                  type="text"
                  v-model="selectedEvent.name"
                  label="Editar Nombre"
                >
                </v-text-field>

                <textarea-autosize
                  v-model="selectedEvent.details"
                  type="text"
                  style="width: 100%"
                  :min-height="100"
                  class="white--text"
                ></textarea-autosize>
              </v-form>
            </v-card-text>

            <v-card-actions>
              <v-btn text class="red" @click="selectedOpen = false">
                Cancelar
              </v-btn>
              <v-btn
                text
                class="yellow darken-2"
                v-if="currentlyEditing !== selectedEvent.id"
                @click.prevent="editEvent(selectedEvent.id)"
                >Editar</v-btn
              >

              <v-btn
                text
                class="blue"
                v-else
                @click.prevent="updateEvent(selectedEvent)"
                >Guardar Cambios</v-btn
              >
            </v-card-actions>
          </v-card>
        </v-menu>
      </v-sheet>
    </v-col>
    <v-snackbar
      v-if="snackbar"
      :value="progressValue"
      absolute
      shaped
      bottom
      color="red"
      ><p class="white--text text-center my-0">
        debe completar todos los campos
      </p>
    </v-snackbar>
  </v-row>
</template>

<script>
import { db } from "@/firebase";

export default {
  data: () => ({
    today: new Date().toISOString().substr(0, 10),
    focus: new Date().toISOString().substr(0, 10),
    type: "month",
    typeToLabel: {
      month: "Mes",
      week: "Week",
      day: "Day",
      "4day": "4 Days",
    },
    start: null,
    end: null,
    selectedEvent: {},
    selectedElement: null,
    selectedOpen: false,
    events: [],
    name: null,
    details: null,
    color: "#1976D2",
    dialog: false,
    currentlyEditing: null,
    snackbar: false,
    progressBarDuration: 3000,
    snackbar: false,
    progressValue: 0,
    progressBarInterval: null,
  }),
  watch: {
    snackbar(newVal) {
      if (newVal) {
        this.snackbar = true;
        this.startProgressBar();
      } else {
        this.snackbar = false;
        this.resetProgressBar();
      }
    },
  },
  computed: {
    title() {
      const { start, end } = this;
      if (!start || !end) {
        return "";
      }

      const startMonth = this.monthFormatter(start);
      const endMonth = this.monthFormatter(end);
      const suffixMonth = startMonth === endMonth ? "" : endMonth;

      const startYear = start.year;
      const endYear = end.year;
      const suffixYear = startYear === endYear ? "" : endYear;

      const startDay = start.day + this.nth(start.day);
      const endDay = end.day + this.nth(end.day);

      switch (this.type) {
        case "month":
          return `${startMonth} ${startYear}`;
        case "week":
        case "4day":
          return `${startMonth} ${startDay} ${startYear} - ${suffixMonth} ${endDay} ${suffixYear}`;
        case "day":
          return `${startMonth} ${startDay} ${startYear}`;
      }
      return "";
    },
    monthFormatter() {
      return this.$refs.calendar.getFormatter({
        timeZone: "UTC",
        month: "long",
      });
    },
  },
  mounted() {
    this.$refs.calendar.checkChange();
  },
  created() {
    this.getEvents();
  },
  methods: {
    startProgressBar() {
      this.progressValue = 0;
      const interval = 100;
      const steps = this.progressBarDuration / interval;
      this.progressBarInterval = setInterval(() => {
        this.progressValue += 100 / steps;
        if (this.progressValue >= 100) {
          this.snackbar = false;
          // Ocultar el Snackbar cuando la barra de progreso alcanza el 100%
        }
      }, interval);
    },
    resetProgressBar() {
      clearInterval(this.progressBarInterval);
    },
    async updateEvent(ev) {
      try {
        await db.collection("eventos").doc(ev.id).update({
          name: ev.name,
          details: ev.details,
        });

        this.selectedOpen = false;
        this.currentlyEditing = null;
      } catch (error) {
        console.log(error);
      }
    },
    editEvent(id) {
      this.currentlyEditing = id;
    },
    async deleteEvent(ev) {
      try {
        await db.collection("eventos").doc(ev.id).delete();
        this.selectedOpen = false;
        this.getEvents();
      } catch (error) {
        console.log(error);
      }
    },
    async addEvent() {
      try {
        // Verificar si start y end son fechas válidas
        const isValidStartDate = Date.parse(this.start);
        const isValidEndDate = Date.parse(this.end);

        if (
          this.name !== null &&
          this.details !== null &&
          isValidStartDate &&
          isValidEndDate
        ) {
          await db.collection("eventos").add({
            name: this.name,
            details: this.details,
            start: this.start,
            end: this.end,
            color: this.color,
          });

          this.getEvents();

          this.name = null;
          this.details = null;
          this.start = null;
          this.end = null;
          this.color = "#1976D2";
        } else {
          console.log("Campos obligatorios o fechas inválidas");
          this.snackbar = true;
        }
      } catch (error) {
        console.log(error);
      }
    },

    async getEvents() {
      try {
        const snapshot = await db.collection("eventos").get();
        const events = [];

        snapshot.forEach((doc) => {
          // console.log(doc.id);
          let eventoData = doc.data();
          eventoData.id = doc.id;
          events.push(eventoData);
        });

        this.events = events;
      } catch (error) {
        console.log(error);
      }
    },
    viewDay({ date }) {
      this.focus = date;
      this.type = "day";
    },
    getEventColor(event) {
      return event.color;
    },
    setToday() {
      this.focus = this.today;
    },
    prev() {
      this.$refs.calendar.prev();
    },
    next() {
      this.$refs.calendar.next();
    },
    showEvent({ nativeEvent, event }) {
      const open = () => {
        this.selectedEvent = event;
        this.selectedElement = nativeEvent.target;
        setTimeout(() => (this.selectedOpen = true), 10);
      };

      if (this.selectedOpen) {
        this.selectedOpen = false;
        setTimeout(open, 10);
      } else {
        open();
      }

      nativeEvent.stopPropagation();
    },
    updateRange({ start, end }) {
      // You could load events from an outside source (like database) now that we have the start and end dates on the calendar
      this.start = start;
      this.end = end;
    },
    nth(d) {
      return d > 3 && d < 21
        ? "th"
        : ["th", "st", "nd", "rd", "th", "th", "th", "th", "th", "th"][d % 10];
    },
  },
};
</script>