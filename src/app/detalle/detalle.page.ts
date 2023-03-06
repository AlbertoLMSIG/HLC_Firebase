import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Dato } from '../dato';
import { FirestoreService } from '../firestore.service';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';
import { ImagePicker } from '@awesome-cordova-plugins/image-picker/ngx';
@Component({
  selector: 'app-detalle',
  templateUrl: './detalle.page.html',
  styleUrls: ['./detalle.page.scss'],
})
export class DetallePage implements OnInit {
  id: string;
  document: any = {
    id: '',
    data: {} as Dato,
  };
  nuevo: boolean;
  handlerMessage = '';
  roleMessage = '';

  constructor(
    private activatedRoute: ActivatedRoute,
    private firestoreService: FirestoreService,
    private router: Router,
    private loadingController: LoadingController,

    private alertController: AlertController,
    private toastController: ToastController,
    private imagePicker: ImagePicker
  ) {}

  ngOnInit() {
    this.id = this.activatedRoute.snapshot.paramMap.get('id');

    if (this.id == 'nuevo') {
      this.nuevo = true;
      this.document.data = {} as Dato;
    } else {
      this.nuevo = false;

      this.firestoreService
        .consultarPorId('datos', this.id)
        .subscribe((resultado) => {
          // Preguntar si se hay encontrado un document con ese ID
          if (resultado.payload.data() != null) {
            this.document.id = resultado.payload.id;
            this.document.data = resultado.payload.data();
            // Como ejemplo, mostrar el título de la tarea en consola
            console.log(this.document.data.empresa);
          } else {
            // No se ha encontrado un document con ese ID. Vaciar los datos que hubiera
            this.document.data = {} as Dato;
          }
        });
    }
  }

  volver() {
    this.router.navigate(['/home']);
  }

  async presentAlert() {
    const alert = await this.alertController.create({
      header: '¡¿Quieres borrar la farmaceutica?!',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: () => {},
        },
        {
          text: 'SI',
          role: 'confirm',
          handler: () => {
            this.clicBotonBorrar();
          },
        },
      ],
    });

    await alert.present();

    const { role } = await alert.onDidDismiss();
    this.roleMessage = `Dismissed with role: ${role}`;
  }

  clicBotonBorrar() {
    this.firestoreService.borrar('datos', this.id).then(() => {
      this.router.navigate(['/home']);
    });
  }

  clicBotonModificar() {
    this.firestoreService
      .actualizar('datos', this.id, this.document.data)
      .then(() => {
        // Actualizar la lista completa
        this.router.navigate(['/home']);
      });
  }

  clickBotonInsertar() {
    this.firestoreService.insertar('datos', this.document.data).then(
      () => {
        console.log('Farmaceutica creada correctamente');
        // //Limpiamos el contenido de televisrorEditanto
        this.document.data = {} as Dato;
      },
      (error) => {
        console.log(error);
      }
    );

    this.router.navigate(['/home']);
    this.presentToast('top');
  }

  async presentToast(position: 'top') {
    const toast = await this.toastController.create({
      message: 'Farmaceutica añadido correctamente',
      duration: 1500,
      position: position,
      color: 'success',
    });

    await toast.present();
  }
  async uploadImagePicker() {
    // Mensaje de espera mientras se sube la imagen
    const loading = await this.loadingController.create({
      message: 'Espera porfavor...',
    });
    //Mensaje de finalizacion de subida de imagen
    const toast = await this.toastController.create({
      message: 'Imagen subida con éxito',
      duration: 3000,
    });
    //Comprobar si la aplicacion tiene permisos de lectura
    this.imagePicker.hasReadPermission().then(
      (result) => {
        //Si no tiene permiso de lectura se solicita al usuario
        if (result == false) {
          this.imagePicker.requestReadPermission();
        } else {
          //Abrir selector de imagenes
          this.imagePicker
            .getPictures({
              maximumImagesCount: 1, //Permite solo 1 imagen
              outputType: 1, //1 = Base64
            })
            .then(
              (results) => {
                // En la variable result tiene las imagenes seleccionadas
                //Carpeta del storage donde se almacenaran las imagenes
                let nombreCarpeta = 'imagenes';
                // Recorrer todas las imagenes que haya seleccionado el usuario
                // Aunque solo sea 1
                for (var i = 0; i < results.length; i++) {
                  // Mostrar el mesaje de espera
                  loading.present();
                  // Asignar el nombre de la imagen en funcion de la hora actual
                  //para evitar duplicados de nombres
                  let nombreImagen = `${new Date().getTime()}`;
                  //Llamar al metodo que sube la imagen al storage
                  this.firestoreService
                    .uploadImage(nombreCarpeta, nombreImagen, results[i])
                    .then((snapshot) => {
                      snapshot.ref.getDownloadURL().then((downloadURL) => {
                        // En la varibale downloadURL esta la direccion de la imagen
                        console.log('downloadURL: ' + downloadURL);
                        this.document.data.imagen = downloadURL;
                        // Mostrar el mensaje de finalizacion de la subida
                        toast.present();
                        // Ocultar imagen de espera
                        loading.dismiss();
                      });
                    });
                }
              },
              (err) => {
                console.log(err);
              }
            );
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  async deleteFile(fileURL) {
    const toast = await this.toastController.create({
      message: 'Archivo eliminado con éxito',
      duration: 3000,
    });
    this.firestoreService.deleteFileFromURL(fileURL).then(
      () => {
        toast.present();
      },
      (err) => {
        console.log(err);
      }
    );
  }
}
