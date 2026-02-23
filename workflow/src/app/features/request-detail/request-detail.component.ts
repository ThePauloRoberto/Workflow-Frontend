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
import { formatDate as _formatDate,
  getStatusClass as _getStatusClass,
  getStatusLabel as _getStatusLabel,
  getPriorityClass as _getPriorityClass,
  getPriorityLabel as _getPriorityLabel} from '../../core/models/utils/formatting'
import { forkJoin } from 'rxjs';

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

  formatDate = _formatDate;
  getStatusClass = _getStatusClass;
  getStatusLabel = _getStatusLabel;
  getPriorityClass = _getPriorityClass;
  getPriorityLabel = _getPriorityLabel;

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
      this.loadData(this.data.requestId)
    }
  }


  loadData(id: string): void {
  this.loading = true;

  forkJoin({
    request: this.requestService.getRequestById(id),
    history: this.requestService.getRequestHistory(id)
  }).subscribe({
    next: ({ request, history }) => {
      this.request = request;
      this.history = history;
      this.canActOnRequest = this.isManager && request?.status === 'PENDING';
      this.loading = false;
    },
    error: () => {
      this.error = 'Erro ao carregar dados';
      this.loading = false;
    }
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
          this.loadData(this.request.id)
        },
        error: (err) => {
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
      this.loadData(this.request.id)
    },
    error: (err) => {
      this.error = 'Erro ao rejeitar solicitação';
    }
  });
}

  closeDialog(): void {
    this.dialogRef.close();
  }

  get reason() {
    return this.rejectForm.get('reason');
  }
}
