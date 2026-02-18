import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { RequestService } from '../../core/services/request.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-request-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
  ],
  templateUrl: './request-detail.component.html',
  styleUrls: ['./request-detail.component.css'],
})
export class RequestDetailComponent implements OnInit {
  request: any = null;
  history: any[] = [];
  loading = true;
  error = '';

  showApproveDialog = false;
  showRejectDialog = false;
  rejectForm: FormGroup;

  isManager = false;
  canActOnRequest = false;
  currentUser: any = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { requestId: string },
    private dialogRef: MatDialogRef<RequestDetailComponent>,
    private requestService: RequestService,
    private authService: AuthService,
    private fb: FormBuilder,
  ) {
    this.rejectForm = this.fb.group({
      reason: ['', [Validators.required, Validators.minLength(5)]],
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getUser();
    this.isManager = this.currentUser?.roles?.includes('Manager') || false;

    if (this.data?.requestId) {
      this.loadRequest(this.data.requestId);
      this.loadHistory(this.data.requestId);
    }
  }

  loadRequest(id: string): void {
    this.loading = true;
    this.requestService.getRequestById(id).subscribe({
      next: (data) => {
        this.request = data;
        this.canActOnRequest =
          this.isManager && this.request?.status === 'PENDING';
        this.loading = false;
      },
      error: (err) => {
        this.error =
          err.status === 404
            ? 'Solicitação não encontrada'
            : 'Erro ao carregar solicitação';
        this.loading = false;
      },
    });
  }

  loadHistory(id: string): void {
    this.requestService.getRequestHistory(id).subscribe({
      next: (data) => {
        console.log('Histórico processado (array):', data);
        this.history = data;
      },
      error: (err) => {
        console.error('Erro ao carregar histórico', err);
        this.history = [];
      },
    });
  }

  onApprove(): void {
    if (!this.canActOnRequest) return;
    this.showApproveDialog = true;
  }

  onConfirmApprove(): void {
    if (!this.request) return;

    this.requestService
      .approveRequest(this.request.id, this.currentUser?.id)
      .subscribe({
        next: (response) => {
          this.showApproveDialog = false;
          this.loadRequest(this.request.id);
          this.loadHistory(this.request.id);
        },
        error: (err) => {
          console.error('Erro ao aprovar', err);
          this.error = 'Erro ao aprovar solicitação';
        },
      });
  }

  onReject(): void {
    if (!this.canActOnRequest) return;
    this.showRejectDialog = true;
    this.rejectForm.reset();
  }

  onConfirmReject(): void {
  if (this.rejectForm.invalid || !this.request) return;

  this.requestService.rejectApprovedRequest(
    this.request.id,
    this.rejectForm.value.reason,
    this.currentUser?.id
  ).subscribe({
    next: (response) => {
      this.showRejectDialog = false;
      this.rejectForm.reset();
      this.loadRequest(this.request.id);
      this.loadHistory(this.request.id);
    },
    error: (err) => {
      console.error('Erro ao rejeitar', err);
      this.error = 'Erro ao rejeitar solicitação';
    }
  });
}

  closeDialog(): void {
    this.dialogRef.close();
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'Pendente';
      case 'APPROVED':
        return 'Aprovado';
      case 'REJECTED':
        return 'Rejeitado';
      default:
        return status || 'Desconhecido';
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'APPROVED':
        return 'bg-success';
      case 'REJECTED':
        return 'bg-danger';
      case 'PENDING':
        return 'bg-warning text-dark';
      default:
        return 'bg-secondary';
    }
  }

  getPriorityClass(priority: string): string {
    switch (priority?.toUpperCase()) {
      case 'HIGH':
      case 'ALTA':
        return 'bg-danger';
      case 'MEDIUM':
      case 'MEDIA':
        return 'bg-warning text-dark';
      case 'LOW':
      case 'BAIXA':
        return 'bg-info text-dark';
      default:
        return 'bg-secondary';
    }
  }

  getPriorityLabel(priority: string): string {
    switch (priority?.toUpperCase()) {
      case 'HIGH':
        return 'Alta';
      case 'MEDIUM':
        return 'Média';
      case 'LOW':
        return 'Baixa';
      default:
        return priority || 'Desconhecida';
    }
  }

  formatDate(date: any): string {
    if (!date) return '';
    return (
      new Date(date).toLocaleDateString('pt-BR') +
      ' ' +
      new Date(date).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    );
  }

  get reason() {
    return this.rejectForm.get('reason');
  }
}
