import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useCallback } from "react"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import FileUploader from "../shared/FileUploader"
import { useCreateStory } from "@/lib/react-query/queriesAndMutations"
import { useUserContext } from "@/context/AuthContext"
import { useToast } from "../ui/use-toast"
import { useNavigate } from "react-router-dom"
import Loader from "../shared/Loader"

const StoryValidation = z.object({
  file: z.custom<File[]>()
    .refine((files) => files.length > 0, "Image is required.")
    .transform(files => files as File[])
});

const StoryForm = () => {
    const { mutateAsync: createStory, isPending: isLoading } = useCreateStory();
    const { user } = useUserContext();
    const navigate = useNavigate();
    const { toast } = useToast()

    const form = useForm<z.infer<typeof StoryValidation>>({
        resolver: zodResolver(StoryValidation),
        defaultValues: {
            file: [],
        },
    })
 
    const handleFileChange = useCallback((files: File[]) => {
        form.setValue("file", files);
    }, [form]);

    async function onSubmit(values: z.infer<typeof StoryValidation>) {
        const fileToUpload = values.file[0];
        if (!(fileToUpload instanceof File)) {
            toast({
                title: "Invalid file. Please select an image.",
                variant: "destructive",
            });
            return;
        }

        try {
            await createStory({
                userId: user.id,
                file: [fileToUpload],
            });

            toast({
                title: "Story created successfully!",
            });
            navigate('/');
        } catch (error) {
            console.error("Error creating story:", error);
            toast({
                title: "An error occurred. Please try again.",
                variant: "destructive",
            });
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-9 w-full max-w-5xl">
                <FormField
                    control={form.control}
                    name="file"
                    render={() => (
                        <FormItem>
                            <FormLabel className="shad-form_label">Add Story Image</FormLabel>
                            <FormControl>
                                <FileUploader fieldChange={handleFileChange} mediaUrl="" />
                            </FormControl>
                            <FormMessage className="shad-form_message"/>
                        </FormItem>
                    )}
                />
                <div className="flex gap-4 items-center justify-end">
                    <Button 
                        type="button" 
                        className="shad-button_dark_4" 
                        onClick={() => navigate('/')}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" className="shad-button_primary whitespace-nowrap" disabled={isLoading}>
                        {isLoading ? <Loader isDark={false} /> : "Create Story"}
                    </Button>
                </div>
            </form>
        </Form>
    )
}

export default StoryForm
