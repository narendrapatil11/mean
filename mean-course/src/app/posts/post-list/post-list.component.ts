import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subscription } from "rxjs";
import { PageEvent } from "@angular/material/paginator";
import { PostModel } from "../post.model";
import { PostsService } from "../posts.service";

@Component({
	selector: 'app-post-list',
	templateUrl: './post-list.component.html',
	styleUrls: ['./post-list.component.scss']
})
export class PostListComponent implements OnInit, OnDestroy {
	posts: PostModel[] = [];
	isLoading: boolean = false
	totalPosts: number = 0;
	postPerPage: number = 2;
	currentPage: number = 1;
	pageSize = [1, 2, 5, 10];
	// @ts-ignore
	private postsSub: Subscription;

	constructor(public postsService: PostsService) {
	}

	ngOnInit() {
		this.isLoading = true;
		this.postsService.getPosts(this.postPerPage, this.currentPage);
		this.postsSub = this.postsService.getPostUpdatedListener()
			.subscribe((postData: { posts: PostModel[], postCount: number }) => {
				this.posts = postData.posts;
				this.totalPosts = postData.postCount;
				this.isLoading = false;
			});
	}

	onChangePage(pageData: PageEvent) {
		this.isLoading = true;
		this.currentPage = pageData.pageIndex + 1;
		this.postPerPage = pageData.pageSize;
		this.postsService.getPosts(this.postPerPage, this.currentPage);
	}

	onDelete(postId: string) {
		this.isLoading = true;
		this.postsService.deletePost(postId).subscribe(() => {
			this.postsService.getPosts(this.postPerPage, this.currentPage);
		});
	}

	ngOnDestroy() {
		this.postsSub.unsubscribe();
	}
}
