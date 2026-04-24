"""
EntityExtractor — robust, production-safe keyword extractor.

Key design decisions:
- NO single-character skills ('c', 'r') that cause massive false-positive matches
  in normal English prose.
- Variant aliases: many skills appear in multiple forms ("node.js", "nodejs",
  "node js"). All aliases map to ONE canonical display name so duplicates
  never appear in results.
- Longest-match first + consumed-span tracking prevents "java" matching inside
  "javascript" or "git" matching inside "digital".
- Strict whole-word boundaries for short tokens (≤4 chars) to avoid spurious hits.
"""

import re
from typing import List, Set, Dict, Tuple


try:
    import spacy
except ImportError:
    spacy = None


# ---------------------------------------------------------------------------
# Canonical skill registry
# Each entry is (canonical_name, [aliases_including_canonical])
# Aliases are the actual strings searched in the text (case-insensitive).
# ---------------------------------------------------------------------------
_SKILL_REGISTRY: List[Tuple[str, List[str]]] = [
    # ── Languages ─────────────────────────────────────────────────────────
    ("python",         ["python", "python3", "python 3"]),
    ("javascript",     ["javascript", "js", "ecmascript", "es6", "es2015"]),
    ("typescript",     ["typescript", "ts"]),
    ("java",           ["java"]),              # word-boundary enforced; won't hit 'javascript'
    ("c++",            ["c++", "cpp", "c plus plus"]),
    ("c#",             ["c#", "csharp", "c sharp"]),
    ("rust",           ["rust"]),
    ("golang",         ["golang", "go lang"]),
    ("swift",          ["swift", "swiftui"]),
    ("kotlin",         ["kotlin"]),
    ("ruby",           ["ruby"]),
    ("php",            ["php"]),
    ("scala",          ["scala"]),
    ("matlab",         ["matlab"]),
    ("perl",           ["perl"]),
    ("bash",           ["bash", "shell scripting", "shell script"]),
    ("powershell",     ["powershell"]),
    ("dart",           ["dart"]),
    ("groovy",         ["groovy"]),
    ("lua",            ["lua"]),
    ("elixir",         ["elixir"]),
    ("haskell",        ["haskell"]),
    ("clojure",        ["clojure"]),
    ("vba",            ["vba"]),
    ("assembly",       ["assembly", "asm"]),
    ("r language",     ["r programming", "rlang"]),   # NOT bare 'r' — too ambiguous

    # ── Frontend Frameworks / Libraries ───────────────────────────────────
    ("react",          ["react", "react.js", "reactjs", "react js"]),
    ("next.js",        ["next.js", "nextjs", "next js"]),
    ("vue.js",         ["vue", "vue.js", "vuejs", "vue js"]),
    ("nuxt.js",        ["nuxt", "nuxt.js", "nuxtjs"]),
    ("angular",        ["angular", "angularjs", "angular.js"]),
    ("svelte",         ["svelte", "sveltekit"]),
    ("astro",          ["astro"]),
    ("ember.js",       ["ember", "ember.js", "emberjs"]),
    ("preact",         ["preact"]),
    ("html",           ["html", "html5"]),
    ("css",            ["css", "css3"]),
    ("sass",           ["sass", "scss"]),
    ("tailwind css",   ["tailwind", "tailwindcss", "tailwind css"]),
    ("bootstrap",      ["bootstrap"]),
    ("material ui",    ["material-ui", "material ui", "mui"]),
    ("chakra ui",      ["chakra ui", "chakra-ui"]),
    ("ant design",     ["ant design", "antd"]),
    ("shadcn/ui",      ["shadcn", "shadcn/ui"]),
    ("redux",          ["redux", "redux toolkit", "rtk"]),
    ("zustand",        ["zustand"]),
    ("mobx",           ["mobx"]),
    ("webpack",        ["webpack"]),
    ("vite",           ["vite"]),
    ("rollup",         ["rollup"]),
    ("esbuild",        ["esbuild"]),
    ("jest",           ["jest"]),
    ("vitest",         ["vitest"]),
    ("cypress",        ["cypress"]),
    ("playwright",     ["playwright"]),
    ("storybook",      ["storybook"]),
    ("three.js",       ["three.js", "threejs", "three js", "webgl"]),
    ("gsap",           ["gsap", "greensock"]),
    ("pnpm",           ["pnpm"]),
    ("yarn",           ["yarn"]),
    ("npm",            ["npm"]),
    ("turborepo",      ["turborepo", "turbo repo"]),

    # ── Backend Frameworks ────────────────────────────────────────────────
    ("node.js",        ["node.js", "nodejs", "node js", "node"]),
    ("express.js",     ["express", "express.js", "expressjs"]),
    ("nestjs",         ["nestjs", "nest.js", "nest js"]),
    ("fastapi",        ["fastapi", "fast api"]),
    ("django",         ["django"]),
    ("flask",          ["flask"]),
    ("spring boot",    ["spring boot", "springboot"]),
    ("spring",         ["spring framework", "spring mvc"]),
    ("rails",          ["rails", "ruby on rails", "ror"]),
    ("laravel",        ["laravel"]),
    ("asp.net",        ["asp.net", "aspnet", "asp net"]),
    (".net",           [".net", "dotnet", "dot net"]),
    ("graphql",        ["graphql", "graph ql"]),
    ("api",            ["api", "apis", "rest api", "restful api", "restful", "rest"]),
    ("grpc",           ["grpc", "grpc api"]),
    ("websockets",     ["websocket", "websockets", "ws"]),
    ("oauth2",         ["oauth", "oauth2", "oauth 2.0"]),
    ("jwt",            ["jwt", "json web token"]),
    ("swagger",        ["swagger", "openapi", "open api"]),
    ("strapi",         ["strapi"]),
    ("contentful",     ["contentful"]),

    # ── Databases ─────────────────────────────────────────────────────────
    ("postgresql",     ["postgresql", "postgres", "psql"]),
    ("mysql",          ["mysql"]),
    ("sqlite",         ["sqlite"]),
    ("microsoft sql server", ["mssql", "sql server", "microsoft sql server"]),
    ("mongodb",        ["mongodb", "mongo"]),
    ("redis",          ["redis"]),
    ("cassandra",      ["cassandra"]),
    ("dynamodb",       ["dynamodb", "dynamo db"]),
    ("firebase",       ["firebase", "firestore"]),
    ("supabase",       ["supabase"]),
    ("elasticsearch",  ["elasticsearch", "elastic search", "opensearch"]),
    ("neo4j",          ["neo4j"]),
    ("influxdb",       ["influxdb"]),
    ("snowflake",      ["snowflake"]),
    ("databricks",     ["databricks"]),
    ("redshift",       ["redshift", "amazon redshift"]),
    ("bigquery",       ["bigquery", "big query"]),
    ("sql",            ["sql", "pl/sql", "t-sql"]),
    ("nosql",          ["nosql", "no-sql"]),
    ("prisma",         ["prisma"]),
    ("sqlalchemy",     ["sqlalchemy"]),
    ("typeorm",        ["typeorm"]),
    ("mongoose",       ["mongoose"]),
    ("sequelize",      ["sequelize"]),
    ("vector database",["vector database", "vector db", "pinecone", "chromadb", "weaviate", "milvus"]),

    # ── Cloud ─────────────────────────────────────────────────────────────
    ("aws",            ["aws", "amazon web services", "amazon aws"]),
    ("azure",          ["azure", "microsoft azure"]),
    ("gcp",            ["gcp", "google cloud", "google cloud platform"]),
    ("heroku",         ["heroku"]),
    ("vercel",         ["vercel"]),
    ("netlify",        ["netlify"]),
    ("cloudflare",     ["cloudflare"]),
    ("digitalocean",   ["digitalocean", "digital ocean"]),
    ("lambda",         ["aws lambda", "serverless functions"]),
    ("s3",             ["amazon s3", "aws s3", "s3 bucket"]),
    ("ec2",            ["aws ec2", "amazon ec2"]),
    ("azure devops",   ["azure devops"]),
    ("azure functions",["azure functions"]),

    # ── DevOps / CI/CD ────────────────────────────────────────────────────
    ("docker",         ["docker", "dockerfile", "docker compose", "docker-compose"]),
    ("kubernetes",     ["kubernetes", "k8s", "kubectl"]),
    ("helm",           ["helm", "helm chart"]),
    ("terraform",      ["terraform"]),
    ("ansible",        ["ansible"]),
    ("jenkins",        ["jenkins"]),
    ("github actions", ["github actions", "gh actions"]),
    ("gitlab ci/cd",   ["gitlab ci", "gitlab ci/cd"]),
    ("circleci",       ["circleci", "circle ci"]),
    ("argocd",         ["argocd", "argo cd"]),
    ("ci/cd",          ["ci/cd", "continuous integration", "continuous deployment",
                        "continuous delivery"]),
    ("nginx",          ["nginx"]),
    ("apache",         ["apache http", "apache server"]),
    ("prometheus",     ["prometheus"]),
    ("grafana",        ["grafana"]),
    ("datadog",        ["datadog"]),
    ("sentry",         ["sentry"]),
    ("linux",          ["linux", "unix"]),
    ("ubuntu",         ["ubuntu"]),

    # ── Version Control ───────────────────────────────────────────────────
    ("git",            ["git"]),          # enforced with strict boundaries
    ("github",         ["github"]),
    ("gitlab",         ["gitlab"]),
    ("bitbucket",      ["bitbucket"]),

    # ── Machine Learning / AI ─────────────────────────────────────────────
    ("machine learning",         ["machine learning", "ml", "scikit learn", "tensorflow", "pytorch", "keras", "cnn"]),
    ("deep learning",            ["deep learning", "dl"]),
    ("artificial intelligence",  ["artificial intelligence", "ai"]),
    ("natural language processing", ["natural language processing", "nlp"]),
    ("computer vision",          ["computer vision", "cv"]),
    ("reinforcement learning",   ["reinforcement learning", "rl"]),
    ("tensorflow",               ["tensorflow", "tf"]),
    ("pytorch",                  ["pytorch", "torch"]),
    ("keras",                    ["keras"]),
    ("scikit-learn",             ["scikit-learn", "sklearn", "scikit learn"]),
    ("xgboost",                  ["xgboost", "xgb"]),
    ("lightgbm",                 ["lightgbm", "lgbm"]),
    ("hugging face",             ["hugging face", "huggingface"]),
    ("transformers",             ["transformers", "bert", "gpt", "llm", "large language model"]),
    ("langchain",                ["langchain", "lang chain"]),
    ("llamaindex",               ["llamaindex", "llama index"]),
    ("openai",                   ["openai", "open ai", "chatgpt api"]),
    ("claude",                   ["claude", "anthropic"]),
    ("gemini",                   ["gemini", "google gemini"]),
    ("mlflow",                   ["mlflow"]),
    ("pandas",                   ["pandas"]),
    ("numpy",                    ["numpy"]),
    ("scipy",                    ["scipy"]),
    ("matplotlib",               ["matplotlib"]),
    ("seaborn",                  ["seaborn"]),
    ("plotly",                   ["plotly"]),
    ("opencv",                   ["opencv", "open cv"]),
    ("nltk",                     ["nltk"]),
    ("spacy",                    ["spacy"]),
    ("feature engineering",      ["feature engineering"]),
    ("model deployment",         ["model deployment", "model serving"]),
    ("a/b testing",              ["a/b testing", "ab testing", "split testing"]),
    ("neural network",           ["neural network", "neural networks", "ann"]),

    # ── Data Engineering ──────────────────────────────────────────────────
    ("data engineering",  ["data engineering"]),
    ("etl",               ["etl", "elt", "etl pipeline"]),
    ("apache spark",      ["apache spark", "spark", "pyspark"]),
    ("hadoop",            ["hadoop"]),
    ("apache kafka",      ["kafka", "apache kafka"]),
    ("apache airflow",    ["airflow", "apache airflow"]),
    ("dbt",               ["dbt", "data build tool"]),
    ("data warehouse",    ["data warehouse", "data warehousing"]),
    ("data lake",         ["data lake", "data lakehouse"]),
    ("tableau",           ["tableau"]),
    ("power bi",          ["power bi", "powerbi"]),
    ("looker",            ["looker"]),
    ("data analysis",     ["data analysis", "data analytics"]),
    ("excel",             ["excel", "microsoft excel", "google sheets", "spreadsheets"]),
    ("data science",      ["data science"]),
    ("data visualization",["data visualization", "data viz", "matplotlib", "seaborn", "plotly", "tableau", "power bi"]),
    ("statistics",        ["statistics", "statistical analysis", "statistical modeling"]),

    # ── Mobile ────────────────────────────────────────────────────────────
    ("react native",  ["react native"]),
    ("flutter",       ["flutter"]),
    ("ionic",         ["ionic"]),
    ("xamarin",       ["xamarin"]),
    ("android",       ["android", "android development"]),
    ("ios",           ["ios", "ios development"]),
    ("expo",          ["expo"]),

    # ── Security ──────────────────────────────────────────────────────────
    ("cybersecurity",       ["cybersecurity", "cyber security", "information security",
                             "infosec"]),
    ("penetration testing", ["penetration testing", "pen testing", "ethical hacking"]),
    ("owasp",               ["owasp"]),
    ("ssl/tls",             ["ssl", "tls", "https", "ssl/tls"]),
    ("encryption",          ["encryption", "cryptography"]),
    ("sso",                 ["sso", "single sign-on"]),
    ("saml",                ["saml"]),
    ("active directory",    ["active directory", "ldap"]),

    # ── Agile / Project Management ────────────────────────────────────────
    ("agile",              ["agile", "agile methodology"]),
    ("scrum",              ["scrum"]),
    ("kanban",             ["kanban"]),
    ("jira",               ["jira"]),
    ("confluence",         ["confluence"]),
    ("product management", ["product management"]),
    ("project management", ["project management", "pmp"]),
    ("sprint planning",    ["sprint planning", "sprint review"]),

    # ── Design / UX ───────────────────────────────────────────────────────
    ("figma",         ["figma"]),
    ("adobe xd",      ["adobe xd", "xd"]),
    ("ux design",     ["ux design", "ux/ui", "ui/ux", "user experience"]),
    ("ui design",     ["ui design", "user interface design"]),
    ("user research", ["user research"]),
    ("wireframing",   ["wireframing", "wireframe"]),
    ("prototyping",   ["prototyping", "prototype"]),
    ("accessibility", ["accessibility", "wcag", "a11y"]),

    # ── Architecture / Patterns ───────────────────────────────────────────
    ("microservices",        ["microservices", "microservice architecture"]),
    ("serverless",           ["serverless"]),
    ("event-driven",         ["event-driven", "event driven architecture", "eda"]),
    ("domain-driven design", ["domain-driven design", "ddd"]),
    ("cqrs",                 ["cqrs"]),
    ("solid principles",     ["solid principles", "solid"]),
    ("tdd",                  ["tdd", "test-driven development", "test driven"]),
    ("bdd",                  ["bdd", "behavior-driven development"]),
    ("system design",        ["system design"]),
    ("api design",           ["api design"]),
    ("distributed systems",  ["distributed systems", "distributed computing"]),
    ("clean architecture",   ["clean architecture", "clean code"]),
    ("micro-frontends",      ["micro-frontends", "microfrontends"]),

    # ── Soft Skills ───────────────────────────────────────────────────────
    ("communication",    ["communication skills", "verbal communication",
                          "written communication", "interpersonal"]),
    ("leadership",       ["leadership", "team lead", "tech lead"]),
    ("collaboration",    ["collaboration", "teamwork", "cross-functional"]),
    ("problem solving",  ["problem solving", "problem-solving"]),
    ("code review",      ["code review", "peer review"]),
    ("mentoring",        ["mentoring", "mentorship", "coaching"]),
    ("public speaking",  ["public speaking", "presentation skills"]),
    ("attention to detail", ["attention to detail", "meticulous"]),
    ("computer science", ["computer science", "cs"]),
    ("software development", ["software development", "software engineering"]),
    ("bachelor", ["bachelor", "b.sc", "bsc", "b.s."]),
]


def _build_patterns(registry: List[Tuple[str, List[str]]]):
    """
    Returns a list of (canonical_name, [compiled_regex_per_alias]) sorted
    longest-alias-first so multi-word terms are tried before their sub-words.
    """
    entries = []
    for canonical, aliases in registry:
        compiled = []
        for alias in aliases:
            alias = alias.strip()
            # Strict word boundary for short tokens (≤ 4 chars) that could
            # appear as substrings in many common words.
            is_short = len(alias) <= 4
            starts_word = bool(re.match(r"\w", alias[0]))
            ends_word   = bool(re.match(r"\w", alias[-1]))

            prefix = r"\b" if starts_word else r"(?<![a-zA-Z0-9\-_])"
            suffix = r"\b" if ends_word   else r"(?![a-zA-Z0-9\-_])"

            if is_short:
                # Extra guard: ensure the token is surrounded by whitespace /
                # punctuation, not embedded in a longer token.
                prefix = r"(?<![a-zA-Z0-9\-_.])"
                suffix = r"(?![a-zA-Z0-9\-_.])"

            pattern = re.compile(
                prefix + re.escape(alias) + suffix,
                re.IGNORECASE,
            )
            compiled.append((len(alias), pattern))

        # Sort aliases longest-first so we try 'spring boot' before 'spring'
        compiled.sort(key=lambda x: x[0], reverse=True)
        entries.append((canonical, compiled))

    # Sort entries by the length of their longest alias, longest first
    entries.sort(key=lambda e: e[1][0][0] if e[1] else 0, reverse=True)
    return entries


_COMPILED_SKILLS = _build_patterns(_SKILL_REGISTRY)


class EntityExtractor:
    def __init__(self, model: str = "en_core_web_sm"):
        self.nlp = None
        if spacy:
            try:
                self.nlp = spacy.load(model)
            except Exception:
                print(f"[Extractor] spaCy model '{model}' not found. Using keyword fallback.")

    # ── Public API ──────────────────────────────────────────────────────────

    def extract_skills(self, text: str) -> Set[str]:
        """
        Extract canonical skill names from *text*.

        Uses consumed-span tracking (longest-match wins) so overlapping aliases
        don't double-count. Returns a set of canonical lowercase names.
        """
        found: Set[str] = set()
        consumed: Set[int] = set()

        for canonical, alias_patterns in _COMPILED_SKILLS:
            for _alias_len, pattern in alias_patterns:
                for m in pattern.finditer(text):
                    span_set = set(range(m.start(), m.end()))
                    if span_set & consumed:
                        continue  # Already claimed by a longer match
                    consumed |= span_set
                    found.add(canonical)
                if canonical in found:
                    break  # One alias match is enough for this canonical skill
            # Don't break the outer loop — different skills may still match

        return found

    def extract_entities(self, text: str) -> Dict[str, List[str]]:
        """Extract named entities (ORG, PERSON, GPE, DATE) via spaCy."""
        entities: Dict[str, List[str]] = {
            "ORG": [], "PERSON": [], "GPE": [], "DATE": [], "EDUCATION": []
        }

        if self.nlp:
            try:
                doc = self.nlp(text)
                for ent in doc.ents:
                    if ent.label_ in entities:
                        entities[ent.label_].append(ent.text)
            except Exception:
                pass

        # Deduplicate preserving order
        for key in entities:
            seen: Set[str] = set()
            deduped = []
            for item in entities[key]:
                norm = item.strip().lower()
                if norm not in seen:
                    seen.add(norm)
                    deduped.append(item.strip())
            entities[key] = deduped

        return entities

    def extract_keywords(self, text: str) -> Set[str]:
        """Skill extraction + spaCy noun chunks."""
        keywords = self.extract_skills(text)
        if self.nlp:
            try:
                doc = self.nlp(text)
                for chunk in doc.noun_chunks:
                    if len(chunk.text.split()) < 3:
                        keywords.add(chunk.text.lower().strip())
            except Exception:
                pass
        return keywords

def extract_keywords(text: str) -> List[str]:
    """Convenience function for keyword extraction. Returns sorted list."""
    keywords = EntityExtractor().extract_keywords(text)
    return sorted(list(keywords))
