'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }
  
  const companyName = formData.get('companyName') as string

  const { data: authData, error } = await supabase.auth.signUp(data)

  if (error) {
    return { error: error.message }
  }

  if (authData.user) {
    try {
      const adminClient = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY! // MUST have this in .env.local
      )
      
      const { error: insertError } = await adminClient
        .from('companies')
        .insert({
          name: companyName,
          owner_id: authData.user.id
        })
        
      if (insertError) {
        console.error("Failed to insert company:", insertError)
      }
    } catch (e) {
      console.error("Failed to create company", e)
    }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}
