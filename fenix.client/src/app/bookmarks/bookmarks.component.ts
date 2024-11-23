import { Component, inject, OnInit, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { ApiService } from '../services/api.service';
import { IApiResponse, IBookmark, IRepository } from '../DTO';

@Component({
  selector: 'bookmarks-search',
  templateUrl: './bookmarks.component.html',
  styleUrl: './bookmarks.component.css',
  standalone: true,
  imports: [   MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    FormsModule,
    MatPaginatorModule,
    MatButtonModule]
})
export class BookmarksComponent implements OnInit {

  private http = inject(ApiService);
  repositories: IRepository[] = [];
  searchQuery: string = '';
  paginator = viewChild(MatPaginator);
  length = 0;
  pageSize = 10;
  pageIndex = 0;
  pageSizeOptions = [5, 10, 25];
  pageEvent: PageEvent | undefined;
  hidePageSize = false;
  showPageSizeOptions = true;
  showFirstLastButtons = true;
  disabled = false;

  ngOnInit() {
    this.http.get<IRepository[]>(`/Bookmark`)
      .subscribe({
        next: (result) => {
          console.log(result);
          if (result.success) {
            this.repositories = result.data ?? [];
            this.length = this.repositories.length
          }
        },
        error: (error) => {
          console.error(error.message);
        }
    });
  }
  search() {
    this.http.get<IRepository[]>(`/Bookmark`)
      .subscribe({
        next: (result) => {
          if (result.success) {
            console.log(result.data);
            if (this.searchQuery.length > 0) {
              this.repositories = result.data?.filter(value => value.full_name === this.searchQuery) ?? [];
            } else {
              this.repositories = result.data ?? [];
            }

          }

        },
        error: (error) => {
          console.error(error.message);
        }
    });
  }
      
  bookmark(repo: any) {
    return this.http.post<IRepository, IRepository[]>(`/Bookmark`, repo).subscribe({
      next: (result: IApiResponse<IRepository[]> | undefined) => {
        if (result?.success)
        if (this.searchQuery.length > 0) {

          this.repositories = result.data?.filter(value => value.full_name === this.searchQuery) ?? [];
        } else {
          this.repositories = result.data ?? [];
          }
      },
      error: (error) => {
        console.error(error.message);
      },
      complete() {

      }
    });
  }

  getBookmarks() {
    return this.http.get<IRepository[]>(`/Bookmark`).subscribe({
      next: (result) => {
        console.log(result);
        if (result?.success)
          if (this.searchQuery.length > 0) {

            this.repositories = result.data?.filter(value => value.full_name === this.searchQuery) ?? [];
          } else {
            this.repositories = result.data ?? [];
          }
      },
      error: (error) => {
        console.error(error.message);
      }
    });
  }

  handlePageEvent(e: PageEvent) {
    this.pageEvent = e;
    this.length = e.length;
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex;
    this.search();
  }
}
