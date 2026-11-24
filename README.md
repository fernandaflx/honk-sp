# HONK! SP 2026 — Guia independente

Programação do Festival de Fanfarras Ativistas de São Paulo, de 26 a 29 de novembro de 2026.

**Site:** https://fernandaflx.github.io/honk-sp/

Guia independente, sem vínculo oficial com a organização. Informações baseadas na programação fornecida. Horários previstos estão identificados; atualizações devem ser confirmadas nos canais oficiais.

## Desenvolvimento

Requisitos: Node.js 22 e pnpm 10.33.2.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Abra http://127.0.0.1:3004. A aplicação usa Next.js App Router, TypeScript, Tailwind CSS e Lucide. Não utiliza banco, autenticação ou backend.

## Programação

Edite **`src/data/schedule.ts`** para atualizar os dias, locais, palcos, fanfarras, atividades, festas e links. Os tipos ficam em `src/data/types.ts` e os utilitários em `src/lib/schedule.ts`.

As 41 atividades são: cinco na quinta-feira, 24 apresentações regulares no sábado e seis participantes em cada uma das duas festas. A programação regular de sexta e domingo está pendente.

- Horários no fuso `America/Sao_Paulo`.
- Quinta tem horários confirmados explícitos; somente sábado utiliza apresentações consecutivas de 45 minutos.
- `timing` indica horários confirmados ou previstos.
- `Party.start` informa o início da festa; não atribui horário a cada fanfarra.
- Perfis de Instagram aceitam múltiplos nomes de usuário, sem `@`. Uma lista vazia omite o link.
- `trombones-sp` e `trombones-rs` são coletivos distintos e possuem perfis diferentes.
- `pending` permite anunciar programação em breve e manter outras atividades ou festas no mesmo dia.
- A grade utiliza células de cinco minutos, respeitando início, término e sobreposições. Atividades sem janela completa aparecem em lista.

## Interface

`src/components/festival-guide.tsx` contém filtros, locais, lista, grade e festas. `src/app/globals.css` define a identidade visual e a responsividade. A lista das festas é recolhida inicialmente e pode ser expandida por “Ver fanfarras”.

Anton e Space Grotesk são carregadas pelo Google Fonts com `display=swap`. Os dados da programação são locais e não exigem chamadas de API. Não há contadores nem ferramentas de rastreamento.

## Validação

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Os testes verificam as referências, 41 atividades, horários de quinta, continuidade do sábado, ingressos, separação dos coletivos e renderização inicial. O build gera HTML, CSS e JavaScript estáticos em `out/`. Para conferir o build local sem subpasta, execute `pnpm build` e `pnpm start` (requer Python 3).

## Publicação

O workflow `.github/workflows/deploy-pages.yml` valida, compila e publica automaticamente cada push na branch `main`. Em **Settings → Pages**, a origem deve ser **GitHub Actions**.

O workflow obtém a URL e a subpasta do próprio GitHub Pages. `PAGES_BASE_PATH` configura o caminho `/honk-sp`; `NEXT_PUBLIC_SITE_URL` configura metadados e a imagem de compartilhamento. Nenhum segredo adicional é necessário.

Para reproduzir o build publicado:

```sh
PAGES_BASE_PATH=/honk-sp NEXT_PUBLIC_SITE_URL=https://fernandaflx.github.io/honk-sp pnpm build
```

Não publique `node_modules/`, `.next/`, arquivos `.env` ou a pasta de cache. O workflow publica somente `out/` como artefato de implantação.
