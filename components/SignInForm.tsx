'use client';

import { signIn } from 'next-auth/react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Divider } from '@/components/ui/divider';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const FormSchema = z.object({
  email: z.email(),
  // password: z.string(),
});

export default function InputForm() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: '',
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    // toast('You submitted the following values', {
    //   description: (
    //     <pre className="mt-2 w-[320px] rounded-md bg-neutral-950 p-4">
    //       <code className="text-white">{JSON.stringify(data, null, 2)}</code>
    //     </pre>
    //   ),
    // });
    toast('You submitted the following values');
    signIn('resend', data);
  }

  return (
    <div className="flex flex-col gap-4">
      <Button className="h-10" onClick={() => signIn('google')}>
        Continue with Google
      </Button>
      {/* <Button onClick={() => signIn('apple')}>Continue with Apple</Button> */}
      {/* <Button onClick={() => signIn('credentials')}>Continue with Email</Button> */}
      <Divider className="my-2">Or</Divider>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="user@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button className="block w-full h-10" type="submit">
            Continue with Email
          </Button>
        </form>
      </Form>
    </div>
  );
}
