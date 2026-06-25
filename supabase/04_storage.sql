-- Create a storage bucket for recipe images
insert into storage.buckets (id, name, public) 
values ('recipe-images', 'recipe-images', true)
on conflict (id) do nothing;

-- Set up security policies for the storage bucket
create policy "Public Access to recipe images" 
on storage.objects for select 
using ( bucket_id = 'recipe-images' );

create policy "Users can upload recipe images" 
on storage.objects for insert 
with check ( bucket_id = 'recipe-images' and auth.uid() = owner );

create policy "Users can update their own recipe images" 
on storage.objects for update 
using ( bucket_id = 'recipe-images' and auth.uid() = owner );

create policy "Users can delete their own recipe images" 
on storage.objects for delete 
using ( bucket_id = 'recipe-images' and auth.uid() = owner );
