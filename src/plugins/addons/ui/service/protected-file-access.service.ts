import {HttpClient, HttpHeaders} from '@angular/common/http';
import{take} from 'rxjs/operators';
import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
@Injectable({
    providedIn: 'any',
  })
export class ProtectedFileAccessService{
    constructor(private httpClient: HttpClient,@Inject(DOCUMENT) private document: HTMLDocument){

    }

    openFile(url:string){
        const token= `Bearer ${localStorage.getItem('vnd_authToken')?.replace('"','').replace('"','')}`;
    const headers = new HttpHeaders().set('authorization',token);
    this.httpClient
      .get(url, {headers,responseType: 'blob' as 'json'})
      .pipe(take(1)).toPromise().then(
        (response: any) =>{
            let dataType = response.type;
            let binaryData:any[] = [];
            binaryData.push(response);
            let downloadLink = document.createElement('a');
            downloadLink.setAttribute("target","_blank");
            downloadLink.href = window.URL.createObjectURL(new Blob(binaryData, {type: dataType}));
            document.body.appendChild(downloadLink);
            downloadLink.click();
        }
    )
    }
}