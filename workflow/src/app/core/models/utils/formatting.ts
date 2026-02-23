  export function getStatusClass(status: any): string {
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

  export function  getStatusLabel(status: any): string {
    const statusNum = status;
    switch (statusNum) {
      case 'PENDING':
        return 'PENDENTE';
      case 'APPROVED':
        return 'APROVADO';
      case 'REJECTED':
        return 'REJEITADO';
      default:
        return 'PENDENTE';
    }
  }

  export function  getPriorityClass(priority: any): string {
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

 export function  getPriorityLabel(priority: any): string {
    const priorityNum = priority;
    switch (priorityNum) {
      case 'Low':
        return 'Baixa';
      case 'Medium':
        return 'Média';
      case 'High':
        return 'Alta';
      default:
        return 'Baixa';
    }
  }

export function formatDate(date: any): string {
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
