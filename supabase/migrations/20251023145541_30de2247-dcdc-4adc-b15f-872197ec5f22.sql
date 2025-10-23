-- Create agents table to store AI agent configurations
CREATE TABLE public.agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  industry TEXT NOT NULL,
  description TEXT,
  mission TEXT NOT NULL,
  context TEXT,
  intents JSONB DEFAULT '[]'::jsonb,
  examples_count INTEGER DEFAULT 0,
  slots_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create handoffs table to store processed handoff data
CREATE TABLE public.handoffs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('audio_recording', 'audio_file', 'text', 'json')),
  content TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  processed_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.handoffs ENABLE ROW LEVEL SECURITY;

-- Public read access for agents (anyone can browse agents)
CREATE POLICY "Anyone can view agents"
  ON public.agents
  FOR SELECT
  USING (true);

-- Public insert for handoffs (anyone can submit handoffs)
CREATE POLICY "Anyone can create handoffs"
  ON public.handoffs
  FOR INSERT
  WITH CHECK (true);

-- Public read for own handoffs
CREATE POLICY "Anyone can view handoffs"
  ON public.handoffs
  FOR SELECT
  USING (true);

-- Create indexes for better performance
CREATE INDEX idx_agents_industry ON public.agents(industry);
CREATE INDEX idx_handoffs_type ON public.handoffs(type);
CREATE INDEX idx_handoffs_created_at ON public.handoffs(created_at DESC);

-- Insert some sample agents
INSERT INTO public.agents (name, industry, description, mission, context, intents, examples_count, slots_count) VALUES
  ('Hotel Booking Assistant', 'Hospitality', 'AI agent specialized in hotel reservations and guest services', 'Help guests find and book the perfect accommodation', 'Understands room types, amenities, pricing, and availability', '[{"name": "book_room", "description": "Book a hotel room"}, {"name": "check_availability", "description": "Check room availability"}]'::jsonb, 45, 12),
  ('Restaurant Reservation Agent', 'Food & Beverage', 'Handles restaurant bookings and menu inquiries', 'Facilitate seamless restaurant reservations', 'Knows cuisine types, seating preferences, dietary restrictions', '[{"name": "make_reservation", "description": "Make a restaurant reservation"}, {"name": "view_menu", "description": "Show menu options"}]'::jsonb, 38, 10),
  ('E-commerce Support Bot', 'Retail', 'Customer service agent for online shopping', 'Assist customers with orders and product information', 'Handles order tracking, returns, product recommendations', '[{"name": "track_order", "description": "Track order status"}, {"name": "process_return", "description": "Process a return"}]'::jsonb, 52, 15);