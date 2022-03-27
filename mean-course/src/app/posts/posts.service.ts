import { Injectable } from "@angular/core";
import { map, Subject } from "rxjs";
import { PostModel } from "./post.model";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";

const POSTS_URL = "http://localhost:4201/api/posts";

@Injectable({providedIn: 'root'})
export class PostsService {
	private posts: PostModel[] = [];
	private postsUpdated = new Subject<PostModel[]>();

	constructor(private http: HttpClient, private router: Router) {}

	getPosts() {
		// return [...this.posts];
		this.http.get<{ message: string, posts: any }>(POSTS_URL)
			.pipe(map((postData) => {
				return postData.posts.map((post: { title: any; content: any; _id: any; }) => ({title: post.title, content: post.content, id: post._id}));
			}))
			.subscribe((updatedPostData) => {
				this.posts = updatedPostData;
				this.postsUpdated.next(([...this.posts]));
			});
	}

	getPostUpdatedListener() {
		return this.postsUpdated.asObservable();
	}

	addPost(title: string, content: string) {
		const post: PostModel = {id: "ASDASDSAD", title, content};
		this.http.post<{ message: string, postId: string }>(POSTS_URL, post)
			.subscribe((resData) => {
				post.id = resData.postId;
				this.posts.push(post);
				this.postsUpdated.next([...this.posts]);
				this.router.navigate(['/'])
			})
	}

	getPost(id: string) {
		return this.http.get<{ message: string, post: { _id: string, title: string, content: string } }>(POSTS_URL + `/${id}`);
	}

	updatePost(postData: PostModel) {
		const post: PostModel = {...postData};
		this.http.put<{ message: string }>(POSTS_URL + `/${post.id}`, post)
			.subscribe((resData) => {
				this.router.navigate(['/'])
			})
	}

	deletePost(postId: string) {
		this.http.delete<{ message: string }>(POSTS_URL + `/${postId}`)
			.subscribe((resData) => {
				console.log(resData.message);
				this.posts = this.posts.filter((p) => (postId !== p.id));
				this.postsUpdated.next([...this.posts]);
			})
	}
}

