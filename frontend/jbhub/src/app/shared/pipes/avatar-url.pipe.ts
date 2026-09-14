import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../../environments/environment';

@Pipe({
  name: 'avatarUrl',
  standalone: true
})
export class AvatarUrlPipe implements PipeTransform {
  transform(photoUrl?: string | null): string | null {
    if (!photoUrl) return null;
    if (photoUrl.startsWith('http')) return photoUrl;
    
    const baseUrl = environment.apiUrl.replace('/api', '');
    return `${baseUrl}${photoUrl}`;
  }
}
