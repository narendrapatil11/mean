import { Injectable } from "@angular/core";
import { map, Subject } from "rxjs";
import { PostModel } from "./post.model";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";

const POSTS_URL = "http://localhost:4201/api/posts";

@Injectable({providedIn: 'root'})
export class PostsService {
	private posts: PostModel[] = [];
	private postsUpdated = new Subject<{posts: PostModel[], postCount: number}>();

	constructor(private http: HttpClient, private router: Router) {}

	getPosts(postPerPage: number, currentPage: number) {
		const queryParams = `?pageSize=${postPerPage}&page=${currentPage}`
		const URL = POSTS_URL + queryParams
		this.http.get<{ message: string, posts: any, maxCount: number }>(URL)
			.pipe(
				map(
					(postData) => {
						return {
							posts: postData.posts.map((post: { title: any; content: any; _id: any; imagePath: string }) => ({
								title: post.title,
								content: post.content,
								id: post._id,
								imagePath: post.imagePath
							})),
							maxCount: postData.maxCount,
						};
					}))
			.subscribe((updatedPostData) => {
				this.posts = updatedPostData.posts;
				this.postsUpdated.next(({posts: [...this.posts], postCount: updatedPostData.maxCount}));
			});
	}

	getPostUpdatedListener() {
		return this.postsUpdated.asObservable();
	}

	addPost(title: string, content: string, image: File) {
		const postData = new FormData();
		postData.append('title', title)
		postData.append('content', content)
		postData.append('image', image, title)

		this.http.post<{ message: string, post: PostModel }>(POSTS_URL, postData)
			.subscribe((resData) => {
				this.router.navigate(['/'])
			})
	}

	getPost(id: string) {
		return this.http.get<{ message: string, post: { _id: string, title: string, content: string, imagePath: string } }>(POSTS_URL + `/${id}`);
	}

	updatePost(postData: PostModel) {
		const post: PostModel = {...postData};
		let postInfo;
		if (typeof post.imagePath === 'object') {
			postInfo = new FormData();
			postInfo.append('id', post.id);
			postInfo.append('title', post.title);
			postInfo.append('content', post.content);
			postInfo.append('image', post.imagePath, post.title);
		} else {
			const postInfo: PostModel = {...post};
		}
		this.http.put<{ message: string }>(POSTS_URL + `/${post.id}`, postInfo)
			.subscribe((resData) => {
				this.router.navigate(['/'])
			})
	}

	deletePost(postId: string) {
		return this.http.delete<{ message: string }>(POSTS_URL + `/${postId}`)
	}
}

