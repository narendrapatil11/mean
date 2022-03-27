import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subscription } from "rxjs";
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

	// @ts-ignore
	private postsSub: Subscription;

	constructor(public postsService: PostsService) {
	}

	ngOnInit() {
		this.isLoading = true;
		this.postsService.getPosts();
		this.postsSub = this.postsService.getPostUpdatedListener()
			.subscribe((postList: PostModel[]) => {
				this.posts = postList;
				this.isLoading = false;
			});
	}

	onDelete(postId: string) {
		this.postsService.deletePost(postId);
	}

	ngOnDestroy() {
		this.postsSub.unsubscribe();
	}
}
