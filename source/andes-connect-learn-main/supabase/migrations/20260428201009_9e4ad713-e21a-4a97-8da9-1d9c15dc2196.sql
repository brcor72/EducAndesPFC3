-- Create demo user (DNI 12345678 / password andes2025)
DO $$
DECLARE
  demo_email text := 'dni12345678@allinyachay.local';
  demo_pwd   text := 'andes2025';
  demo_id    uuid;
BEGIN
  SELECT id INTO demo_id FROM auth.users WHERE email = demo_email;

  IF demo_id IS NULL THEN
    demo_id := gen_random_uuid();

    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      demo_id,
      'authenticated',
      'authenticated',
      demo_email,
      crypt(demo_pwd, gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object(
        'display_name', 'Maritza Quispe (Demo)',
        'community',    'Comunidad de ejemplo',
        'preferred_lang','es',
        'dni',           '12345678'
      ),
      now(),
      now(),
      '',
      '',
      '',
      ''
    );

    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      demo_id,
      jsonb_build_object('sub', demo_id::text, 'email', demo_email),
      'email',
      demo_id::text,
      now(),
      now(),
      now()
    );
  END IF;
END $$;