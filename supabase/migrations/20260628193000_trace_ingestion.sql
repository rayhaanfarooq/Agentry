create extension if not exists pgcrypto;

create table if not exists public.traces (
    trace_id uuid primary key default gen_random_uuid(),
    project_id uuid null,
    name text not null,
    service_name text not null,
    environment text not null,
    status text not null,
    started_at timestamptz not null,
    ended_at timestamptz not null,
    duration_ms double precision not null,
    metadata jsonb not null default '{}'::jsonb,
    tags jsonb not null default '[]'::jsonb,
    inputs jsonb null,
    outputs jsonb null,
    model_name text null,
    model_provider text null,
    temperature double precision null,
    input_tokens integer null,
    output_tokens integer null,
    total_tokens integer null,
    error_type text null,
    error_message text null,
    sdk_name text not null,
    sdk_version text not null,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists ix_traces_project_id on public.traces (project_id);
create index if not exists ix_traces_created_at on public.traces (created_at desc);
create index if not exists ix_traces_project_id_created_at on public.traces (project_id, created_at desc);
create index if not exists ix_traces_service_name on public.traces (service_name);
create index if not exists ix_traces_environment on public.traces (environment);
create index if not exists ix_traces_status on public.traces (status);
create index if not exists ix_traces_model_name on public.traces (model_name);

create table if not exists public.spans (
    span_id uuid primary key default gen_random_uuid(),
    trace_id uuid not null references public.traces (trace_id) on delete cascade,
    parent_span_id uuid null references public.spans (span_id) on delete set null,
    name text not null,
    span_type text null,
    status text not null,
    started_at timestamptz not null,
    ended_at timestamptz not null,
    duration_ms double precision not null,
    metadata jsonb not null default '{}'::jsonb,
    inputs jsonb null,
    outputs jsonb null,
    model_name text null,
    model_provider text null,
    temperature double precision null,
    input_tokens integer null,
    output_tokens integer null,
    total_tokens integer null,
    error_type text null,
    error_message text null,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists ix_spans_trace_id on public.spans (trace_id);
create index if not exists ix_spans_parent_span_id on public.spans (parent_span_id);
create index if not exists ix_spans_trace_id_started_at on public.spans (trace_id, started_at);

create table if not exists public.tool_calls (
    tool_call_id uuid primary key default gen_random_uuid(),
    trace_id uuid not null references public.traces (trace_id) on delete cascade,
    span_id uuid null references public.spans (span_id) on delete set null,
    name text not null,
    status text not null,
    started_at timestamptz not null,
    ended_at timestamptz not null,
    duration_ms double precision not null,
    metadata jsonb not null default '{}'::jsonb,
    arguments jsonb null,
    result jsonb null,
    error_type text null,
    error_message text null,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists ix_tool_calls_trace_id on public.tool_calls (trace_id);
create index if not exists ix_tool_calls_span_id on public.tool_calls (span_id);
create index if not exists ix_tool_calls_trace_id_started_at on public.tool_calls (trace_id, started_at);

create table if not exists public.trace_events (
    event_id uuid primary key default gen_random_uuid(),
    trace_id uuid not null references public.traces (trace_id) on delete cascade,
    span_id uuid null references public.spans (span_id) on delete set null,
    name text not null,
    event_type text not null,
    sequence integer null,
    timestamp timestamptz not null,
    payload jsonb not null default '{}'::jsonb,
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists ix_trace_events_trace_id on public.trace_events (trace_id);
create index if not exists ix_trace_events_span_id on public.trace_events (span_id);
create index if not exists ix_trace_events_trace_id_timestamp on public.trace_events (trace_id, timestamp);
