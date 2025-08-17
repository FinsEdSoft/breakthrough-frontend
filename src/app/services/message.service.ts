import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Message {
  id: string;
  content: string;
  order: number;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private readonly baseUrl = 'http://breakthrough.runasp.net';

  constructor(private readonly http: HttpClient) {}

  getMessages(userId: string | undefined): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.baseUrl}/messages?userId=${userId}`);
  }
}
