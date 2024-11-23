import { Component, inject, OnInit, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { ApiService } from '../services/api.service';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { IBookmark, IRepository } from '../DTO';

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
  private route = inject(ActivatedRoute);
  private router = inject(Router);

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
    this.route.queryParams.subscribe(params => {
      this.searchQuery = params['q']; // Replace 'q' with your actual query parameter name
      if (this.searchQuery) {
        this.search(); // Perform search if a query parameter exists
      }
    });
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
          if (result.success) {
            console.log(result);
            this.length = result.data?.total_count ?? 0;
            this.repositories = result.data?.items;
            // Update the URL with the search query
            const navigationExtras: NavigationExtras = {
              queryParams: { q: this.searchQuery },
              queryParamsHandling: 'merge' // This will preserve existing query parameters
            };
            this.router.navigate([], navigationExtras);
          }
        },
        error: (error) => {
          console.error(error.message);
        }
    });
  }

  bookmark(repo: IRepository) {
    return this.http.post<IRepository, IRepository[]>(`/Bookmark`, repo).subscribe({
      next: (result) => {
        if (result.success) {
          this.bookmarks = result.data ?? [];
        }
      },
      error: (error) => {
        console.error(error.message);
      }
    });
  }

  getBookmarks() {
    this.http.get<IRepository[]>(`/Bookmark`)
      .subscribe({
        next: (result) => {
          if (result.success) {
            this.bookmarks = result.data ?? [];
          }
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
