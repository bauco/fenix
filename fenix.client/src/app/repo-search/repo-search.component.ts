import { Component, inject, OnInit, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-repo-search',
  templateUrl: './repo-search.component.html',
  styleUrl: './repo-search.component.css',
  standalone: true,
  imports: [   MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    FormsModule,
    MatPaginatorModule,
    MatButtonModule]
})
export class RepoSearchComponent implements OnInit {
  private http = inject(ApiService);
  repositories: any = [];
  searchQuery: any;
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
  bookmarks: any[] = [];

  ngOnInit() {
    this.getBookmarks();
  }
  search() {
    this.http.get<{
      incomplete_results: boolean;
      items: any[];
      total_count: number;
    }>(`/Search?&query=${this.searchQuery}&page=${this.pageIndex + 1}&per_page=${this.pageSize}`)
      .subscribe({
        next: (result) => {
          console.log(result);
          this.length = result.total_count
          this.repositories = result.items;
        },
        error: (error) => {
          console.error(error.message);
        }
    });
  }
      
  bookmark(repo: any) {
    return this.http.post<any[]>(`/Bookmark`, repo).subscribe({
      next: (result) => {
        this.bookmarks = result
      },
      error: (error) => {
        console.error(error.message);
      }
    });
  }

  getBookmarks() {
    this.http.get<any[]>(`/Bookmark`)
      .subscribe({
        next: (result) => {
          this.bookmarks = result;
        },
        error: (error) => {
          console.error(error.message);
        }
      });
  }
  isBookmarked(repo: any) {
    return this.bookmarks.some(bookmark => bookmark.id === repo.id);
  }
  handlePageEvent(e: PageEvent) {
    this.pageEvent = e;
    this.length = e.length;
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex;
    this.search();
  }
}
