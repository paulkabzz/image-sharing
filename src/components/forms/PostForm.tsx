import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useCallback } from "react";

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "../ui/textarea"
import FileUploader from "../shared/FileUploader"
import { PostValidation } from "@/lib/validation"
import { Models } from "appwrite"
import { useCreatePost, useUpdatePost } from "@/lib/react-query/queriesAndMutations"
import { useUserContext } from "@/context/AuthContext"
import { useToast } from "../ui/use-toast"
import { useNavigate } from "react-router-dom"
import Loader from "../shared/Loader"

type PostFormProps = {
    post?: Models.Document,
    action: "Create" | "Update",
}

const PostForm = ({ post, action }: PostFormProps) => {

    const { mutateAsync: createPost, isPending: isLoadingCreate } = useCreatePost();

    const { mutateAsync: updatePost, isPending: isLoadingUpdate } = useUpdatePost();

    const { user } = useUserContext();
    const navigate = useNavigate();
    const { toast } = useToast()


     // 1. Define your form.
   const form = useForm<z.infer<typeof PostValidation>>({
    resolver: zodResolver(PostValidation),
    defaultValues: {
      caption: post ? post?.caption : "",
      file: [],
      location: post ? post?.location : "",
      tags: post ? post.tags.join(',').slice() : ""
    },
  })
 
  // Add this function to handle file changes
  const handleFileChange = useCallback((files: File[]) => {
    form.setValue("file", files);
  }, [form]);

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof PostValidation>) {

    if (post && action === 'Update') {
        const updatedPost = await updatePost({
          ...values,
          postId: post.$id,
          imageId: post?.imageId,
          imageUrl: post?.imageUrl
        })

        if (!updatedPost) {
          toast({ title: "Please try again."}) 
          return;
      }

        return navigate(`/posts/${post.$id}`)
   
    }

    
    const fileToUpload = values.file[0];
    if (!(fileToUpload instanceof File)) {
        toast({
          title: "Invalid file. Please select an image.",
          variant: "destructive",
        });
        return;
    }

    try {
        const newPost = await createPost({
            ...values,
            userId: user.id,
            file: [fileToUpload], // Ensure we're passing a File object
        });

        if (!newPost) {
            toast({
                title: "Failed to create post. Please try again.",
                variant: "destructive",
            });
        } else {
            navigate('/');
        }
    } catch (error) {
        console.error("Error creating post:", error);
        toast({
            title: "An error occurred. Please try again.",
            variant: "destructive",
        });
    }
  }

  const loading = isLoadingCreate || isLoadingUpdate;

  const handleCancel = () => {
    // Navigate back to the previous page
    navigate(-1);
  };

  return (
    <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-9 w-full max-w-5xl">
      <FormField
        control={form.control}
        name="caption"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="shad-form_label">Caption</FormLabel>
            <FormControl>
              <Textarea  {...field} className="shad-textarea custom-scrollbar"/>
            </FormControl>
            <FormMessage className="shad-form_message"/>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="file"
        render={() => (
          <FormItem>
            <FormLabel className="shad-form_label">Add Photos</FormLabel>
            <FormControl>
              <FileUploader fieldChange={handleFileChange}  mediaUrl={post?.imageUrl}/>
            </FormControl>
            <FormMessage className="shad-form_message"/>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="location"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="shad-form_label">Add Location</FormLabel>
            <FormControl>
              <Input type="text" className="shad-input" {...field}/>
            </FormControl>
            <FormMessage className="shad-form_message"/>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="tags"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="shad-form_label">Add Tags (Sperated by comma ",")</FormLabel>
            <FormControl>
              <Input type="text" className="shad-input" placeholder="Sport, Music, Expression, etc." {...field} />
            </FormControl>
            <FormMessage className="shad-form_message"/>
          </FormItem>
        )}
      />
      <div className="flex gap-4 items-center justify-end">
        <Button 
          type="button" 
          className="shad-button_dark_4" 
          onClick={handleCancel}
        >
          Cancel
        </Button>
      
        <Button type="submit" className="shad-button_primary whitespace-nowrap" disabled={loading}>
          { loading ? <Loader isDark={false} /> : action }
        </Button>
      </div>
      
    </form>
  </Form>
  )
}

export default PostForm