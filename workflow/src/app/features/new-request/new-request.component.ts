import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MatDialogRef,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { RequestService } from '../../core/services/request.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-new-request',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
  ],
  templateUrl: './new-request.component.html',
  styleUrls: ['./new-request.component.css'],
})
export class NewRequestComponent implements OnInit {
  requestForm: FormGroup;
  submitting = false;
  error = '';

  categories = ['Compras', 'TI', 'Reembolso', 'Outros'];
  priorities = [
    { value: 'Low', label: 'Baixa' },
    { value: 'Medium', label: 'Média' },
    { value: 'High', label: 'Alta' },
  ];

  constructor(
    private dialogRef: MatDialogRef<NewRequestComponent>,
    private fb: FormBuilder,
    private requestService: RequestService,
    private authService: AuthService,
  ) {
    this.requestForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      category: ['', Validators.required],
      priority: ['Medium', Validators.required],
    });
  }

  ngOnInit(): void {
    if (!this.authService.isUser()) {
      this.dialogRef.close();
    }
  }

  onSubmit(): void {
    if (this.requestForm.invalid) {
      this.markFormGroupTouched(this.requestForm);
      return;
    }

    this.submitting = true;
    this.error = '';

    const formValue = this.requestForm.value;

    const priorityMap: { [key: string]: number } = {
      Low: 0,
      Medium: 1,
      High: 2,
    };

    const requestData = {
      title: formValue.title,
      description: formValue.description,
      category: formValue.category,
      priority: priorityMap[formValue.priority] || 1,
      status: 0,
      create_by: this.authService.getUserId(),
    };

    this.requestForm.disable();

    this.requestService.createRequest(requestData).subscribe({
      next: (response: any) => {
        this.dialogRef.close('created');
      },
      error: (err) => {
        if (err.error) {
          this.error =
            err.error.message || err.error.title || JSON.stringify(err.error);
        } else {
          this.error = 'Erro ao criar solicitação. Tente novamente.';
        }

        this.submitting = false;
        this.requestForm.enable();
      },
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  get title() {
    return this.requestForm.get('title');
  }
  get description() {
    return this.requestForm.get('description');
  }
  get category() {
    return this.requestForm.get('category');
  }
}
