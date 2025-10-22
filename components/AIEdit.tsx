'use client';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import clsx from 'clsx';
import { z } from 'zod';
import { getNanoBananaSchema } from '@/lib/utils/zod';
import {
  CircleQuestionMarkIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ImageIcon,
  Loader2Icon,
} from 'lucide-react';
import { useFalAsyncGeneration } from '@/lib/hooks/ai';
import SelectImage2 from '@/components/SelectImage2';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import { Spin } from '@/components/ui/spin';
import ImagePreview from '@/components/ImagePreview';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Select2 } from '@/components/ui/select';
import { OUTPUT_FORMATS, NUMBER_OF_IMAGES, MAX_FILES } from '@/lib/utils/const';
import { NanoBananaRequest } from '@/lib/types';
import { PromptsKey } from '@/lib/db/prompt';

export default function AIEdit({
  prompt,
  filesRequired,
}: {
  prompt?: PromptsKey;
  filesRequired?: boolean;
}) {
  const [showMore, setShowMore] = useState(false);
  const { generate, result, isLoading, inferenceTime } =
    useFalAsyncGeneration();
  const FormSchema = getNanoBananaSchema({
    promptRequired: !prompt,
    filesRequired,
  });
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      prompt,
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    console.log(data);
    await generate({
      ...data,
      // modelId: 'v0',
      prompt: prompt || data.prompt,
      files: data.files?.map((it) => it.file),
    } as NanoBananaRequest);
  }

  const url = result?.data?.images?.[0]?.url; // || '/test.png';
  return (
    <div className="main-widths">
      <div className="grid gap-6 sm:grid-cols-12 p-6">
        <div className="rounded border sm:col-span-6 p-4 space-y-6">
          <h3 className="font-semibold sm:text-xl">Input</h3>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {!prompt && (
                <FormField
                  control={form.control}
                  name="prompt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Prompt
                        <Popover>
                          <PopoverTrigger>
                            <CircleQuestionMarkIcon size={16} />
                          </PopoverTrigger>
                          <PopoverContent>
                            The text prompt used to edit the image
                          </PopoverContent>
                        </Popover>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="The text prompt used to edit the image"
                          // className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="files"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Image
                      <Popover>
                        <PopoverTrigger>
                          <CircleQuestionMarkIcon size={16} />
                        </PopoverTrigger>
                        <PopoverContent>
                          Images for editing. Presently, up to {MAX_FILES} image
                          inputs are allowed. If over {MAX_FILES} images are
                          sent, only the last {MAX_FILES} will be used.
                        </PopoverContent>
                      </Popover>
                    </FormLabel>
                    <FormControl>
                      <SelectImage2 {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormItem>
                <FormLabel className="flex justify-between">
                  Additional Settings
                  <Divider className="flex-1" />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowMore((pre) => !pre)}
                  >
                    {showMore ? (
                      <>
                        Less
                        <ChevronUpIcon size={16} />
                      </>
                    ) : (
                      <>
                        More
                        <ChevronDownIcon size={16} />
                      </>
                    )}
                  </Button>
                </FormLabel>
              </FormItem>

              {showMore && (
                <>
                  <FormField
                    control={form.control}
                    name="num_images"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Images</FormLabel>
                        <FormControl>
                          <Select2
                            defaultValue={1}
                            className="w-full"
                            {...field}
                            placeholder="Select image size"
                            items={NUMBER_OF_IMAGES}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="output_format"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Output Format</FormLabel>
                        <FormControl>
                          <Select2
                            defaultValue="jpeg"
                            className="w-full"
                            {...field}
                            placeholder="Select output format"
                            items={OUTPUT_FORMATS}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <Button className="w-full" type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2Icon className="animate-spin" />
                    Please Wait...
                  </>
                ) : (
                  'Submit'
                )}
              </Button>
            </form>
          </Form>
        </div>
        <div className="rounded border sm:col-span-6 p-4 space-y-6">
          <h3 className="font-semibold sm:text-xl">Result</h3>
          <div className="flex items-center justify-center h-[calc(100%-100px)]">
            <Spin spinning={isLoading} tip="Processing...">
              <div
                className={clsx('h-[366px] flex items-center justify-center', {
                  processing: isLoading,
                })}
              >
                {url ? (
                  <ImagePreview src={url} alt="Result" />
                ) : (
                  <ImageIcon
                    className={clsx({ hidden: isLoading })}
                    size={66}
                    strokeWidth={1}
                  />
                )}
              </div>
            </Spin>
          </div>
          <div className="text-sm">
            {inferenceTime && (
              <span>Time taken: {inferenceTime.toFixed(1)}s</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
