import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { combineLatest, debounceTime, distinctUntilChanged } from 'rxjs';
import {
  RequestFilter,
  RequestService,
} from '../../core/services/request.service';
import { AuthService } from '../../core/services/auth.service';
import { Status } from '../../core/models/utils/Status.enum';
import { MatDialog } from '@angular/material/dialog';
import { RequestDetailComponent } from '../request-detail/request-detail.component';
import { NewRequestComponent } from '../new-request/new-request.component';

@Component({
  selector: 'app-requests',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule],
  templateUrl: './requests.component.html',
  styleUrls: ['./requests.component.css'],
})
export class RequestsComponent implements OnInit {
  requests: any[] = [];
  loading = false;
  Math = Math;

  statusFilter = new FormControl('');
  categoryFilter = new FormControl('');
  priorityFilter = new FormControl('');
  searchFilter = new FormControl('');
  createdByFilter = new FormControl('');

  categories: string[] = [];

  userName: string = '';
  userRole: string = '';
  isUser: boolean = false;
  isManager: boolean = false;
  currentUserId: string = '';
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 1;
  pageSizeOptions = [5, 10, 20, 50];
  orderBy = 'created_at';
  orderDirection = 'desc';

  allRequests: any[] = [];
  displayedRequests: any[] = [];

  constructor(
    private requestService: RequestService,
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog,
  ) {}
  ngOnInit(): void {
    const user = this.authService.getUser();

    if (user) {
      this.currentUserId = user.id;
      this.userName = user.name || '';

      let roles: string[] = [];

      if (user.roles && Array.isArray(user.roles)) {
        roles = user.roles;
      } else if (user.roles) {
        roles = [user.roles];
      }
      this.userRole = roles.length > 0 ? roles[0] : '';
      this.isUser = roles.includes('User');
      this.isManager = roles.includes('Manager');
    }

    this.loadRequests();
    this.setupFilters();
    this.loadCategories();
  }

  setupFilters(): void {
    this.statusFilter.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.currentPage = 1;
        this.applyFilters();
      });

    this.categoryFilter.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.currentPage = 1;
        this.applyFilters();
      });

    this.priorityFilter.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.currentPage = 1;
        this.applyFilters();
      });

    this.searchFilter.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe(() => {
        this.currentPage = 1;
        this.applyFilters();
      });

    if (this.isManager) {
      this.createdByFilter.valueChanges
        .pipe(debounceTime(500), distinctUntilChanged())
        .subscribe((value) => {
          this.currentPage = 1;
          this.applyFilters();
        });
    }
  }

  loadCategories(): void {
    this.requestService.getRequests({ pageSize: 100 }).subscribe({
      next: (response) => {
        const uniqueCategories = new Set<string>();
        response.items.forEach((req: any) => {
          if (req.category) uniqueCategories.add(req.category);
        });
        this.categories = Array.from(uniqueCategories).sort();
      },
    });
  }

  loadRequests(): void {
    this.loading = true;

    const filter: RequestFilter = {
      page: this.currentPage,
      pageSize: 100,
      orderBy: this.orderBy,
      orderDirection: this.orderDirection,
    };

    this.requestService.getRequests(filter).subscribe({
      next: (response) => {
        response.items.forEach((req: any, index: number) => {
        });

        this.allRequests = response.items;

        if (this.isUser) {
          const antes = this.allRequests.length;
          this.allRequests = this.allRequests.filter((req) => {
            const pertence = req.create_by === this.currentUserId;
            return pertence;
          });
        } else {
        }

        this.extractCategories(this.allRequests);
        this.applyFilters();

        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
      },
    });
  }

  extractCategories(requests: any[]): void {
    const uniqueCategories = new Set<string>();
    requests.forEach((req) => {
      if (req.category) uniqueCategories.add(req.category);
    });
    this.categories = Array.from(uniqueCategories).sort();
  }

  clearFilters(): void {
    this.statusFilter.setValue('');
    this.categoryFilter.setValue('');
    this.priorityFilter.setValue('');
    this.searchFilter.setValue('');
    this.createdByFilter.setValue('');
  }

  openApproveDialog(request: any): void {
    const dialogRef = this.dialog.open(RequestDetailComponent, {
      width: '800px',
      maxWidth: '90vw',
      data: {
        requestId: request.id,
        openApproveDialog: true,
      },
      panelClass: 'request-detail-dialog',
    });
  }

  openRejectDialog(request: any): void {
    const dialogRef = this.dialog.open(RequestDetailComponent, {
      width: '800px',
      maxWidth: '90vw',
      data: {
        requestId: request.id,
        openRejectDialog: true,
      },
      panelClass: 'request-detail-dialog',
    });
  }

  openRequestDetails(request: any): void {
    this.dialog.open(RequestDetailComponent, {
      width: '800px',
      maxWidth: '90vw',
      data: { requestId: request.id },
      panelClass: 'request-detail-dialog',
    });
  }

  getStatusClass(status: any): string {
    const statusNum = status;
    switch (statusNum) {
      case 'APPROVED':
        return 'bg-success';
      case 'REJECTED':
        return 'bg-danger';
      default:
        return 'bg-warning text-dark';
    }
  }

  getStatusLabel(status: any): string {
    const statusNum = status;
    switch (statusNum) {
      case 'PENDING':
        return 'PENDING';
      case 'APPROVED':
        return 'APPROVED';
      case 'REJECTED':
        return 'REJECTED';
      default:
        return 'PENDING';
    }
  }

  getPriorityClass(priority: any): string {
    const priorityNum = priority;
    switch (priorityNum) {
      case 'High':
        return 'bg-danger';
      case 'Medium':
        return 'bg-warning text-dark';
      default:
        return 'bg-info text-dark';
    }
  }

  getPriorityLabel(priority: any): string {
    const priorityNum = priority;
    switch (priorityNum) {
      case 'Low':
        return 'Low';
      case 'Medium':
        return 'Medium';
      case 'High':
        return 'High';
      default:
        return 'Low';
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

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  toggleOrderDirection(): void {
    this.orderDirection = this.orderDirection === 'ASC' ? 'DESC' : 'ASC';
    this.loadRequests();
  }

  applyFilters(): void {
    let filtered = [...this.allRequests];

    if (this.statusFilter.value) {
      filtered = filtered.filter(
        (req) => req.status === this.statusFilter.value,
      );
    }

    if (this.categoryFilter.value) {
      filtered = filtered.filter(
        (req) => req.category === this.categoryFilter.value,
      );
    }
    if (this.priorityFilter.value) {
      filtered = filtered.filter(
        (req) => req.priority === this.priorityFilter.value,
      );
    }

    if (this.searchFilter.value) {
      const searchTerm = this.searchFilter.value.toLowerCase();
      filtered = filtered.filter(
        (req) =>
          req.title.toLowerCase().includes(searchTerm) ||
          req.description.toLowerCase().includes(searchTerm),
      );
    }

    if (this.createdByFilter.value && this.isManager) {
      const searchId = this.createdByFilter.value.trim().toLowerCase();
      filtered = filtered.filter((req) => {
        if (!req.create_by) return false;
        const matches = req.create_by.toLowerCase().includes(searchId);
        return matches;
      });
    }
    filtered = this.sortRequests(filtered);

    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.displayedRequests = filtered.slice(start, end);

    this.totalItems = filtered.length;
    this.totalPages = Math.ceil(this.totalItems / this.pageSize);
  }

  sortRequests(requests: any[]): any[] {
    const orderBy = this.orderBy;
    const direction = this.orderDirection === 'asc' ? 1 : -1;

    return [...requests].sort((a, b) => {
      let valA = a[orderBy];
      let valB = b[orderBy];

      if (orderBy === 'created_at') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }

      if (valA < valB) return -1 * direction;
      if (valA > valB) return 1 * direction;
      return 0;
    });
  }

  openNewRequestModal(): void {
    const dialogRef = this.dialog.open(NewRequestComponent, {
      width: '600px',
      maxWidth: '95vw',
      disableClose: true,
      panelClass: 'new-request-dialog',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'created') {
        this.loadRequests();
      }
    });
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.applyFilters();
  }

  changePageSize(size: string): void {
    this.pageSize = Number(size);
    this.currentPage = 1;
    this.applyFilters();
  }

  getPages(): number[] {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  setOrderDirection(direction: 'asc' | 'desc'): void {
    if (this.orderDirection !== direction) {
      this.orderDirection = direction;
      this.currentPage = 1;
      this.loadRequests();
    }
  }
}
