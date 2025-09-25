(() => {
  let isFirstTime = true;
  // Change this component at your convenience:
  Vue.component("App", {
    template: $template,
    props: {
      uuid: {
        type: String,
        default: () => {
          return Vue.prototype.$lsw.utils.getRandomString(10);
        }
      }
    },
    data() {
      return {
        isMounted: false,
        selectedPage: "editor", // also: "editor", "formulario", "respuestas"
        selectedEditorSubpage: "constructor", // also: "codigo", "constructor"
        formulario: [],
        codigo_de_formulario: "",
        campos_escondidos: [],
        descripciones_desplegadas: [],
        respuestas: {},
      };
    },
    methods: {
      selectPage(page) {
        this.$trace("App.methods.selectPage");
        if (page === "editor") {
          // @OK
        } else if (page === "formulario") {
          this.ensureAllIdsExistAndAreUnique();
        } else if (page === "respuestas") {
          // @TODO
        }
        this.selectedPage = page;
      },
      toggleCampo(bloqueIndex) {
        this.$trace("App.methods.toggleCampo");
        const pos = this.campos_escondidos.indexOf(bloqueIndex);
        console.log(pos, this.campos_escondidos)
        if (pos === -1) {
          this.campos_escondidos.push(bloqueIndex);
        } else {
          this.campos_escondidos.splice(pos, 1);
        }
        this.$forceUpdate(true);
      },
      toggleDescripcion(bloqueIndex) {
        this.$trace("App.methods.toggleDescripcion");
        const pos = this.descripciones_desplegadas.indexOf(bloqueIndex);
        if (pos === -1) {
          this.descripciones_desplegadas.push(bloqueIndex);
        } else {
          this.descripciones_desplegadas.splice(pos, 1);
        }
        this.$forceUpdate(true);
      },
      setBloqueValue(bloqueIndex, prop, value) {
        this.$trace("App.methods.setBloqueValue");
        console.log(value);
        this.formulario[bloqueIndex] = Object.assign({}, this.formulario[bloqueIndex], {
          [prop]: value
        });
        this.$forceUpdate(true);
      },
      addBloqueToFormulario() {
        this.$trace("App.methods.addBloqueToFormulario");
        this.formulario.push({
          id: "",
          pregunta: "",
          descripcion: "",
          requerido: false,
          tipo: "texto",
          relleno: "",
          interludio: null,
        });
      },
      removeBloqueFromFormulario(bloqueIndex) {
        this.$trace("App.methods.removeBloqueFromFormulario");
        this.formulario.splice(bloqueIndex, 1);
      },
      saveJsonToFormulario() {
        this.$trace("App.methods.saveJsonToFormulario");
        this.formulario = JSON.parse(this.$refs.editor_de_formulario_en_json.value);
      },
      getEditorHeightForStyles() {
        this.$trace("App.methods.getEditorHeightForStyles");
        return "height: " + (this.$window.innerHeight - 140) + "px";
      },
      propagateCalendarioValue(formItem, value, component) {
        this.$trace("App.methods.propagateCalendarioValue");
        const datestring = LswTimer.utils.fromDateToDatestring(value, true);
        this.respuestas[formItem.id] = datestring;
        component.$el.parentElement.previousElementSibling.value = datestring;
        this.$forceUpdate(true);
      },
      ensureAllIdsExistAndAreUnique() {
        this.$trace("App.methods.ensureAllIdsExistAndAreUnique");
        try {
          const knownIds = [];
          Iterating_bloques_de_formulario:
          for (let index = 0; index < this.formulario.length; index++) {
            const bloque = this.formulario[index];
            if (bloque.tipo === "interludio") {
              continue Iterating_bloques_de_formulario;
            }
            if (bloque.id.trim() === "") {
              throw new Error(`Campo nº ${index+1} no tiene identificador propio`);
            }
            const pos = knownIds.map(it => it.id).indexOf(bloque.id);
            if(pos !== -1) {
              throw new Error(`Campo nº ${knownIds[pos].index+1} y nº ${index+1} tienen el mismo identificador «${bloque.id}»`);
            }
            knownIds.push({ id: bloque.id, index});
          }
        } catch (error) {
          this.$lsw.toasts.showError(error);
          throw error;
        }
      },
      exportarFormularioVacio() {
        this.$trace("App.methods.exportarFormularioVacio");
        const query = new URLSearchParams({
          formulario: JSON.stringify(this.formulario)
        }).toString();
        const urlCompleta = window.location.origin + window.location.pathname + "?" + query;
        LswUtils.copyToClipboard(urlCompleta);
      },
      exportarFormularioCumplimentado() {
        this.$trace("App.methods.exportarFormularioCumplimentado");
        const query = new URLSearchParams({
          formulario: JSON.stringify(this.formulario),
          respuestas: JSON.stringify(this.respuestas),
        }).toString();
        const urlCompleta = window.location.origin + window.location.pathname + "?" + query;
        LswUtils.copyToClipboard(urlCompleta);
      },
    },
    async mounted() {
      console.log("[💛] Application mounted.");
      if(!this.isMounted) {
        Inyectar_parametrizacion: {
          const params = new URLSearchParams(window.location.search);
          const formulario = params.get("formulario");
          const respuestas = params.get("respuestas");
          try {
            if(formulario) {
              this.formulario = JSON.parse(formulario);
              this.selectPage("formulario");
            }
            if(respuestas) {
              this.respuestas = JSON.parse(respuestas);
              this.selectPage("respuestas");
            }
          } catch (error) {
            this.$lsw.toasts.showError(error);
            console.log(error);
          }
        }
      }
      this.isMounted = true;
    }
  });
})(); 