import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const envFile = fs.readFileSync('.env', 'utf8');
const env: Record<string, string> = {};
envFile.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) {
    env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
  }
});

const url = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
const key = env.SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY;

console.log('Connecting to Supabase:', url);
const supabase = createClient(url, key);

async function testConnection() {
  try {
    const { data: p, error: pErr } = await supabase.from('profiles').select('*').limit(1);
    console.log('profiles table exists:', !pErr, pErr ? pErr.message : 'OK');

    const { data: rb, error: rbErr } = await supabase.from('resume_builder').select('*').limit(1);
    console.log('resume_builder table exists:', !rbErr, rbErr ? rbErr.message : 'OK');

    const { data: ra, error: raErr } = await supabase.from('resume_analysis').select('*').limit(1);
    console.log('resume_analysis table exists:', !raErr, raErr ? raErr.message : 'OK');

    const { data: sa, error: saErr } = await supabase.from('skill_assessments').select('*').limit(1);
    console.log('skill_assessments table exists:', !saErr, saErr ? saErr.message : 'OK');

    const { data: mi, error: miErr } = await supabase.from('mock_interviews').select('*').limit(1);
    console.log('mock_interviews table exists:', !miErr, miErr ? miErr.message : 'OK');

    const { data: res, error: resErr } = await supabase.from('resumes').select('*').limit(1);
    console.log('resumes table exists:', !resErr, resErr ? resErr.message : 'OK');
  } catch (e) {
    console.error('Test execution failed:', e);
  }
}

testConnection();
