import { Component } from '@angular/core';
import { FirestoreService } from '../firestore.service';
import { Dato } from '../dato';
import { Router } from '@angular/router';
import { CallNumber } from '@awesome-cordova-plugins/call-number/ngx';
import { SocialSharing } from '@awesome-cordova-plugins/social-sharing/ngx';
import * as L from 'leaflet';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  

  idTareaSelec: string;
  tareaEditando: Dato;
  arrayColeccionTareas: any = [
    {
      id: '',
      data: {} as Dato,
    },
  ];
  map: L.Map;
  newMarker:any;
  address:string[];
  constructor(private firestoreService: FirestoreService, private router: Router, private callNumber: CallNumber,private socialSharing: SocialSharing) {
    this.tareaEditando = {} as Dato;

    this.obtenerListaFarmaceuticas();
  }

  clickBotonInsertar() {

    this.router.navigate(['/detalle', "nuevo"]);

  }

  obtenerListaFarmaceuticas() {
    this.firestoreService
      .consultar('datos')
      .subscribe((resultadoConsultaFarmaceuticas) => {
        this.arrayColeccionTareas = [];
        resultadoConsultaFarmaceuticas.forEach((datosFarmaceutica: any) => {
          this.arrayColeccionTareas.push({
            id: datosFarmaceutica.payload.doc.id,
            data: datosFarmaceutica.payload.doc.data()
          });
        });
      });
  }


  selecFarmaceutica(tareaSelec) {
    console.log("Dato seleccionado: ");
    console.log(tareaSelec);
    this.idTareaSelec = tareaSelec.id;
    this.tareaEditando.empresa = tareaSelec.data.empresa;
    this.tareaEditando.medicamento = tareaSelec.data.medicamento;
    this.router.navigate(['/detalle', this.idTareaSelec]);
  }

  clicBotonBorrar() {
    this.firestoreService.borrar("datos", this.idTareaSelec).then(() => {
      // Actualizar la lista completa
      this.obtenerListaFarmaceuticas();
      // Limpiar datos de pantalla
      this.tareaEditando = {} as Dato;
    })
  }


  clicBotonModificar() {
    this.firestoreService.actualizar("datos", this.idTareaSelec, this.tareaEditando).then(() => {
      // Actualizar la lista completa
      this.obtenerListaFarmaceuticas();
      // Limpiar datos de pantalla
      this.tareaEditando = {} as Dato;
    })
  }

  llamar() {
    this.callNumber.callNumber("608727689", true)
      .then(res => console.log('Llamada realizada', res))
      .catch(err => console.log('Error en realizar la llamada', err));
  }
  ionViewDidEnter() {
    this.loadMap();
  }

  loadMap() {
    let latitud = 36.6797047;
    let longitud = -5.4470656;
    let zoom = 17;
    this.map = L.map("mapId").setView([latitud, longitud], zoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
      .addTo(this.map);
  }

  compartir() {
    const options = {
      message: 'Hola esto es compartir con SocialSharing',
      chooserTitle: 'Compartir con...'
    };
    
    this.socialSharing.shareWithOptions(options)
      .then(() => {
        console.log('Mensaje compartido correctamente');
      }).catch((error) => {
        console.log('Error al compartir el mensaje: ', error);
});
}


}