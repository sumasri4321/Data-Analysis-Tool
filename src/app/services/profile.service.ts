// src/app/services/profile.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DbConnectionParams } from './migration-data.service'; // Re-use DbConnectionParams

// Define a minimal ConnectionProfile interface for the frontend to send
export interface ConnectionProfile {
  name: string;
  jdbcUrl: string; // You'll need to construct this
  username: string;
  password?: string;
  dbType: string; // e.g., 'POSTGRESQL', 'MYSQL'
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = 'http://localhost:8080/api/db-profiles'; // Adjust if your backend port/path is different

  constructor(private http: HttpClient) { }

  saveConnectionProfile(profile: ConnectionProfile): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/save`, profile);
  }
}