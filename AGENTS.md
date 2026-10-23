<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- The index route is now the Fluxo financial dashboard, as requested by the owner.
- Preserve TanStack/Lovable infrastructure and Git history.
- Calculate currency in integer cents, preserve imported historical tax/fee values, and do not fabricate missing order counts.
- Local browser storage is not cloud sync or authentication. Keep this limitation visible.
- API credentials must never be stored in client code.
