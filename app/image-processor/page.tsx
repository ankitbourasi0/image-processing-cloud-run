"use client"
import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Upload, Image as ImageIcon, RefreshCw } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast"
import BG from '../images/BG2.jpg';
import Image from 'next/image';


const formSchema = z.object({
  file: z.instanceof(File).nullable(),
  operation: z.enum(['jpg-to-png', 'png-to-jpg', 'compress-jpg', 'compress-png', 'resize']),
  quality: z.number().min(1).max(100).optional(),
  width: z.number().min(1).max(10000).optional(),
  height: z.number().min(1).max(10000).optional(),
});

type FormValues = z.infer<typeof formSchema>;

const ImageProcessor: React.FC = () => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      operation: 'jpg-to-png',
      quality: 50,
      width: 100,
      height: 100,
    },
  });

  const fileType = form.watch('file')?.type;
  const selectedOperation = form.watch('operation');
  const isValidFileType = () => {
    if (!fileType) return false;
    switch (selectedOperation) {
      case 'jpg-to-png':
      case 'compress-jpg':
        return fileType === 'image/jpeg';
      case 'png-to-jpg':
      case 'compress-png':
        return fileType === 'image/png';
      case 'resize':
        return fileType.startsWith('image/');
      default:
        return false;
    }
  };
  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setError(null);

    
  if (!values.file) {
    setError('No file selected');
    setIsLoading(false);
    return;
  }
    const formData = new FormData();
    formData.append('file', values.file);

    let endpoint: string;
    switch (values.operation) {
      case 'jpg-to-png':
        endpoint = '/convert/jpg-to-png';
        break;
      case 'png-to-jpg':
        endpoint = '/convert/png-to-jpg';
        break;
      case 'compress-jpg':
        endpoint = '/compress/jpg';
        formData.append('quality', values.quality!.toString());
        break;
      case 'compress-png':
        endpoint = '/compress/png';
        formData.append('quality', values.quality!.toString());
        break;
      case 'resize':
        endpoint = '/resize';
        formData.append('width', values.width!.toString());
        formData.append('height', values.height!.toString());
        break;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_CLOUD_RUN_URL}${endpoint}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setProcessedImageUrl(url);

      toast({
        title: "Success",
        description: "Image processed successfully!",
        variant: "default",
      });

    } catch (err) {
    console.error('Error processing image:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "An error occurred while processing the image. Please try again.",
        variant: "destructive",
      });
      setError(err instanceof Error ? err.message : 'An error occurred while processing the image. Please try again.');
      } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue('file', file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      form.setValue('file', null);
      setPreviewUrl(null);
    }
  };

  useEffect(() => {
    // Clear preview and processed images when operation changes
    setPreviewUrl(null);
    setProcessedImageUrl(null);
    
    // Clear the file input
    form.setValue('file', null);
    
    // Reset the file input element
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [form.watch('operation')]);

  return (
    <div className="min-h-screen w-full bg-cover bg-center p-8" style={{ backgroundImage: `url(${BG.src})` }}>
     
      <Card className="w-full max-w-2xl mx-auto shadow-xl bg-white/90 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-xl text-white">
          <CardTitle className="text-2xl font-bold">Image Processor</CardTitle>
          <CardDescription className="text-blue-100">Upload an image to convert, compress, or resize it.</CardDescription>
        </CardHeader>
        <CardContent className="mt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="file"
                render={({ }) => (
                  <FormItem>
                    <FormLabel>Upload Image</FormLabel>
                    <FormControl>
                      <Input type="file" accept="image/*"  ref={fileInputRef} onChange={handleFileChange} className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {previewUrl && (
                <div className="mt-4">
                 <Image src={previewUrl} alt="Preview" width={500} height={300} layout="responsive" className="rounded-lg shadow-md" />
                </div>
              )}

              <FormField
                control={form.control}
                name="operation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Operation</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full bg-white">
                          <SelectValue placeholder="Select an operation" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white">
                        <SelectItem value="jpg-to-png">JPG to PNG</SelectItem>
                        <SelectItem value="png-to-jpg">PNG to JPG</SelectItem>
                        <SelectItem value="compress-jpg">Compress JPG</SelectItem>
                        <SelectItem value="compress-png">Compress PNG</SelectItem>
                        <SelectItem value="resize">Resize</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {(form.watch('operation') === 'compress-jpg' || form.watch('operation') === 'compress-png') && (
                <FormField
                  control={form.control}
                  name="quality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quality: {field.value}</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} className="bg-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {form.watch('operation') === 'resize' && (
                <>
                  <FormField
                    control={form.control}
                    name="width"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Width</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} className="bg-white" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="height"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Height</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} className="bg-white" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <Button type="submit" disabled={isLoading || !form.watch('file') || !isValidFileType()}  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white">
                {isLoading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Process Image
                  </>
                )}
              </Button>
            </form>
          </Form>

          {!isValidFileType() && form.watch('file') && (
            <Alert variant="destructive" className="mt-4">
              <AlertTitle>Invalid File Type</AlertTitle>
              <AlertDescription>
                The selected file type does not match the chosen operation. Please select a {selectedOperation.includes('jpg') ? 'JPG' : 'PNG'} file.
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {processedImageUrl && (
            <div className="mt-6 p-4 bg-white rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Processed Image</h3>
              <Image src={processedImageUrl} alt="Processed" width={500} height={300} layout="responsive" className="rounded-lg shadow-md" />
              <Button asChild className="mt-4 bg-green-500 hover:bg-green-600">
                <a href={processedImageUrl} download>
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Download Processed Image
                </a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ImageProcessor;