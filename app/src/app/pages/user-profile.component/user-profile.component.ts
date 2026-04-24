import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../shared/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../model/user';

@Component({
  selector: 'app-user-profile.component',
  standalone: false,
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss',
})
export class UserProfileComponent implements OnInit {

  user!: User;
  form!: FormGroup;

  isLoading = true;
  isSaving = false;

  selectedFile: File | null = null;
  previewImage: string | null = null;

  constructor(private fb: FormBuilder, private userSrv: UserService, private authSrv: AuthService) {
    this.form = this.fb.group({
      address: ['', [
        Validators.required,
        Validators.minLength(5)
      ]],
      phone: ['', [
        Validators.required,
        Validators.pattern(/^[0-9]{10}$/)
      ]]
    });
  }

  getField(field: string) {
    return this.form.get(field);
  }

  ngOnInit(): void {
    this.loadUser();
  }

  loadUser() {
    // Simulación (reemplaza por tu servicio)
    this.authSrv.getCurrentUser().subscribe({
      next: (user) => {
        this.user = user;
        this.form.patchValue({ address: user?.address, phone: user.phone });
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando usuario', err);
        this.isLoading = false;
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.selectedFile = file;

    const reader = new FileReader();

    reader.onload = () => {
      this.previewImage = reader.result as string;
    };

    reader.readAsDataURL(file);
  }

  async updateProfile() {
    this.isSaving = true;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    let imagePayload = null;

    if (this.selectedFile && this.previewImage) {
      imagePayload = {
        image: this.previewImage.split(',')[1], // base64 limpio
        fileType: this.selectedFile.type
      };
    }

    const payload = {
      ...this.form.value,
    };

    const imagen = {
      ...(imagePayload && { image: imagePayload })
    }

    console.log('Payload listo para backend:', imagen);

    if (this.user?.user_id) {
      this.userSrv.updateUser(this.user.user_id, { ...payload }).subscribe({
        next: (res) => {
          console.log('Perfil actualizado', res);
          if (imagePayload) {
            this.userSrv.uploadAvatar(this.user!.user_id!, imagePayload).subscribe({
              next: (res) => {
                console.log('Avatar actualizado', res);
              },
              error: (err) => {
                console.error('Error subiendo avatar', err);
              }
            });
          }
          this.isSaving = false;
        },
        error: (err) => {
          console.error('Error actualizando perfil', err);
          this.isSaving = false;
        }
      });
    }
  }
}
