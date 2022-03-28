import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { PostsService } from "../posts.service";
import { ActivatedRoute } from "@angular/router";
import { PostModel } from "../post.model";
import { mimeType } from "./mime-type.validator";

@Component({
	selector: 'app-post-create',
	templateUrl: './post-create.component.html',
	styleUrls: ['./post-create.component.scss']
})
export class PostCreateComponent implements OnInit {
	enteredTitle = ''
	enteredContent = ''
	post: PostModel|undefined
	isLoading = false;
	// @ts-ignore
	form: FormGroup;
	imagePreview: string|undefined

	private mode = 'create'
	private postId: string|undefined

	constructor(public postService: PostsService, public route: ActivatedRoute) { }

	ngOnInit() {
		this.form = new FormGroup({
			title: new FormControl(
				null,
				{validators: [Validators.required, Validators.minLength(3)]}
			),
			content: new FormControl(null, {validators: [Validators.required]}),
			image: new FormControl(null, {validators: [Validators.required], asyncValidators: mimeType})
		})
		this.route.paramMap.subscribe((param) => {
			if (param.has('postId')) {
				this.mode = 'edit'
				this.postId = param.get('postId') as string;
				this.isLoading = true;
				this.postService.getPost(this.postId).subscribe((postData) => {
					this.isLoading = false;
					const {_id: id, title, content, imagePath} = postData.post;
					this.post = {id, content, title, imagePath}
					this.form.setValue({title, content,})
				})
			} else {
				this.mode = 'create'
				this.postId = '';
			}
		})
	}

	onAddPost() {
		if (this.form.invalid) {
			return;
		}
		this.isLoading = true;
		if (this.mode === 'edit' && this.postId) {
			this.postService.updatePost({
				id: this.postId,
				title: this.form.value.title,
				content: this.form.value.content,
				imagePath: '',
			});
		} else {
			this.postService.addPost(this.form.value.title, this.form.value.content, this.form.value.image);
			this.form.reset();
		}
	}

	onImagePicked(event: Event) {
		// @ts-ignore
		const file = (event.target as HTMLInputElement)?.files[0];
		this.form.patchValue({image: file});
		this.form.get('image')?.updateValueAndValidity();
		const reader = new FileReader();
		reader.onload = () => {
			this.imagePreview = reader.result as string;
		}
		reader.readAsDataURL(file);
	}
}
