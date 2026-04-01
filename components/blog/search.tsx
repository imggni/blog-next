interface SearchProps {
  defaultValue?: string;
}

export function Search({ defaultValue = "" }: SearchProps) {
  return (
    <form className="flex w-full flex-col gap-3 rounded-2xl border border-border/70 bg-card p-5 sm:flex-row">
      <input
        type="search"
        name="query"
        defaultValue={defaultValue}
        placeholder="搜索文章标题、描述或标签"
        className="h-11 flex-1 rounded-xl border border-border bg-background px-4 text-sm outline-none transition-colors focus:border-primary"
      />
      <button
        type="submit"
        className="h-11 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
      >
        搜索
      </button>
    </form>
  );
}
