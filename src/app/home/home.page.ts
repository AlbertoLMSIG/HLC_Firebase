import { Component } from '@angular/core';
import { FirestoreService } from '../firestore.service';
import { Dato } from '../dato';
import { Router } from '@angular/router';
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

  constructor(private firestoreService: FirestoreService, private router:Router) {
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

}