'use client'

// src/components/quiz/GroupedTechSelect.tsx
// Grouped multi-select for Q2: Current Skills

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Code2, 
  Layout, 
  Server, 
  Smartphone, 
  Cloud, 
  Database, 
  LucideIcon, 
  Check, 
  X, 
  Search, 
  ChevronDown, 
  ChevronRight, 
  Hash,
  Brain,
  Link as LinkIcon
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface Technology {
  slug: string
  name: string
  popularity: number
}

interface TechGroup {
  id: string
  label: string
  icon: LucideIcon
  technologies: Technology[]
  defaultExpanded: boolean
}

const TECH_GROUPS: TechGroup[] = [
  {
    id: 'languages',
    label: 'Languages',
    icon: Code2,
    defaultExpanded: true,
    technologies: [
      { slug: 'javascript', name: 'JavaScript', popularity: 95 },
      { slug: 'python', name: 'Python', popularity: 88 },
      { slug: 'typescript', name: 'TypeScript', popularity: 82 },
      { slug: 'java', name: 'Java', popularity: 75 },
      { slug: 'c-sharp', name: 'C#', popularity: 68 },
      { slug: 'go', name: 'Go', popularity: 65 },
      { slug: 'rust', name: 'Rust', popularity: 58 },
      { slug: 'php', name: 'PHP', popularity: 55 },
      { slug: 'ruby', name: 'Ruby', popularity: 48 },
      { slug: 'swift', name: 'Swift', popularity: 45 },
      { slug: 'kotlin', name: 'Kotlin', popularity: 42 },
      { slug: 'cpp', name: 'C++', popularity: 40 },
      { slug: 'scala', name: 'Scala', popularity: 35 },
      { slug: 'dart', name: 'Dart', popularity: 32 },
    ]
  },
  {
    id: 'databases',
    label: 'Databases',
    icon: Database,
    defaultExpanded: false,
    technologies: [
      { slug: 'postgresql', name: 'PostgreSQL', popularity: 80 },
      { slug: 'mysql', name: 'MySQL', popularity: 75 },
      { slug: 'mongodb', name: 'MongoDB', popularity: 72 },
      { slug: 'redis', name: 'Redis', popularity: 68 },
      { slug: 'sqlite', name: 'SQLite', popularity: 60 },
      { slug: 'elasticsearch', name: 'Elasticsearch', popularity: 55 },
      { slug: 'dynamodb', name: 'DynamoDB', popularity: 48 },
    ]
  },
  {
    id: 'backend',
    label: 'Backend',
    icon: Server,
    defaultExpanded: false,
    technologies: [
      { slug: 'nodejs', name: 'Node.js', popularity: 85 },
      { slug: 'express', name: 'Express.js', popularity: 78 },
      { slug: 'django', name: 'Django', popularity: 65 },
      { slug: 'flask', name: 'Flask', popularity: 58 },
      { slug: 'spring-boot', name: 'Spring Boot', popularity: 70 },
      { slug: 'fastapi', name: 'FastAPI', popularity: 62 },
      { slug: 'graphql', name: 'GraphQL', popularity: 55 },
      { slug: 'rest', name: 'REST APIs', popularity: 88 },
      { slug: 'nestjs', name: 'NestJS', popularity: 48 },
    ]
  },
  {
    id: 'frontend',
    label: 'Frontend',
    icon: Layout,
    defaultExpanded: false,
    technologies: [
      { slug: 'react', name: 'React', popularity: 90 },
      { slug: 'vue', name: 'Vue.js', popularity: 65 },
      { slug: 'angular', name: 'Angular', popularity: 58 },
      { slug: 'next-js', name: 'Next.js', popularity: 72 },
      { slug: 'svelte', name: 'Svelte', popularity: 48 },
      { slug: 'tailwindcss', name: 'Tailwind CSS', popularity: 68 },
      { slug: 'html', name: 'HTML', popularity: 98 },
      { slug: 'css', name: 'CSS', popularity: 96 },
      { slug: 'sass', name: 'Sass/SCSS', popularity: 52 },
      { slug: 'webpack', name: 'Webpack', popularity: 50 },
    ]
  },
  {
    id: 'devops',
    label: 'DevOps',
    icon: Hash,
    defaultExpanded: false,
    technologies: [
      { slug: 'docker', name: 'Docker', popularity: 76 },
      { slug: 'kubernetes', name: 'Kubernetes', popularity: 65 },
      { slug: 'git', name: 'Git', popularity: 95 },
      { slug: 'ci-cd', name: 'CI/CD', popularity: 70 },
      { slug: 'terraform', name: 'Terraform', popularity: 55 },
      { slug: 'jenkins', name: 'Jenkins', popularity: 45 },
      { slug: 'ansible', name: 'Ansible', popularity: 40 },
    ]
  },
  {
    id: 'cloud',
    label: 'Cloud',
    icon: Cloud,
    defaultExpanded: false,
    technologies: [
      { slug: 'aws', name: 'AWS', popularity: 82 },
      { slug: 'azure', name: 'Azure', popularity: 68 },
      { slug: 'gcp', name: 'Google Cloud', popularity: 58 },
      { slug: 'vercel', name: 'Vercel', popularity: 62 },
      { slug: 'netlify', name: 'Netlify', popularity: 55 },
      { slug: 'heroku', name: 'Heroku', popularity: 50 },
    ]
  },
  {
    id: 'mobile',
    label: 'Mobile',
    icon: Smartphone,
    defaultExpanded: false,
    technologies: [
      { slug: 'react-native', name: 'React Native', popularity: 68 },
      { slug: 'flutter', name: 'Flutter', popularity: 65 },
      { slug: 'ios', name: 'iOS Development', popularity: 55 },
      { slug: 'android', name: 'Android Development', popularity: 58 },
      { slug: 'xamarin', name: 'Xamarin', popularity: 35 },
    ]
  },
  {
    id: 'ai-ml',
    label: 'AI/ML',
    icon: Brain,
    defaultExpanded: false,
    technologies: [
      { slug: 'pytorch', name: 'PyTorch', popularity: 65 },
      { slug: 'tensorflow', name: 'TensorFlow', popularity: 60 },
      { slug: 'scikit-learn', name: 'Scikit-learn', popularity: 55 },
      { slug: 'openai', name: 'OpenAI API', popularity: 75 },
      { slug: 'huggingface', name: 'Hugging Face', popularity: 68 },
    ]
  },
  {
    id: 'blockchain',
    label: 'Blockchain',
    icon: LinkIcon,
    defaultExpanded: false,
    technologies: [
      { slug: 'solidity', name: 'Solidity', popularity: 45 },
      { slug: 'ethers', name: 'Ethers.js', popularity: 40 },
      { slug: 'web3js', name: 'Web3.js', popularity: 38 },
      { slug: 'hardhat', name: 'Hardhat', popularity: 35 },
    ]
  },
]

interface GroupedTechSelectProps {
  value: string[]
  onChange: (value: string[]) => void
  className?: string
}

export function GroupedTechSelect({ value, onChange, className }: GroupedTechSelectProps) {
  const [expandedGroups, setExpandedGroups] = useState<string[]>(
    TECH_GROUPS.filter(g => g.defaultExpanded).map(g => g.id)
  )
  const [showAllInGroup, setShowAllInGroup] = useState<Record<string, boolean>>({})
  const [searchQuery, setSearchQuery] = useState('')
  const prefersReducedMotion = useReducedMotion()

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev =>
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    )
  }

  const toggleTech = (slug: string) => {
    onChange(
      value.includes(slug)
        ? value.filter(s => s !== slug)
        : [...value, slug]
    )
  }

  const toggleGroupSelection = (groupId: string, techs: Technology[]) => {
    const techSlugs = techs.map(t => t.slug)
    const allSelected = techSlugs.every(slug => value.includes(slug))
    
    if (allSelected) {
      onChange(value.filter(slug => !techSlugs.includes(slug)))
    } else {
      const toAdd = techSlugs.filter(slug => !value.includes(slug))
      onChange([...value, ...toAdd])
    }
  }

  const toggleShowAll = (groupId: string) => {
    setShowAllInGroup(prev => ({ ...prev, [groupId]: !prev[groupId] }))
  }

  // Filter groups by search query
  const filteredGroups = useMemo(() => {
    if (!searchQuery) return TECH_GROUPS

    const query = searchQuery.toLowerCase()
    return TECH_GROUPS.map(group => ({
      ...group,
      technologies: group.technologies.filter(tech =>
        tech.name.toLowerCase().includes(query) ||
        tech.slug.toLowerCase().includes(query)
      ),
    })).filter(group => group.technologies.length > 0)
  }, [searchQuery])

  const selectedCount = value.length
  
  // Find all tech names for display
  const allTechs = useMemo(() => {
    const map = new Map<string, string>()
    TECH_GROUPS.forEach(g => {
      g.technologies.forEach(t => map.set(t.slug, t.name))
    })
    return map
  }, [])

  return (
    <div className={cn('space-y-4', className)}>
      {/* Stats and Clear All */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Hash className="h-3 w-3" />
          </div>
          <p className="text-sm font-medium text-foreground">
            {selectedCount} technologies selected
          </p>
        </div>
        {selectedCount > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onChange([])}
            className="h-7 text-xs text-muted-foreground hover:text-destructive"
          >
            Clear all
          </Button>
        )}
      </div>

      {/* Selected tech display */}
      <AnimatePresence>
        {selectedCount > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-primary/5 border border-primary/10"
          >
            {value.map(slug => (
              <Badge
                key={slug}
                variant="secondary"
                className="pl-2 pr-1 py-1 gap-1 bg-background border-primary/20"
              >
                <span className="text-xs font-medium">{allTechs.get(slug) || slug}</span>
                <button
                  type="button"
                  className="rounded-full p-0.5 hover:bg-muted"
                  onClick={() => toggleTech(slug)}
                >
                  <X className="w-3 h-3 text-muted-foreground" />
                </button>
              </Badge>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search and Category Quick Filters */}
      <div className="relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for a technology..."
          className="pl-10 h-11 bg-muted/30 border-muted focus:bg-background transition-all"
        />
        {searchQuery && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => setSearchQuery('')}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Technology groups */}
      <div className="space-y-3">
        {filteredGroups.map(group => {
          const selectedInGroup = group.technologies.filter(t =>
            value.includes(t.slug)
          ).length
          const allInCategorySelected = group.technologies.every(t => value.includes(t.slug))
          
          const visibleTechs = showAllInGroup[group.id] || searchQuery
            ? group.technologies
            : group.technologies.slice(0, 9)
          const hasMore = group.technologies.length > 9 && !searchQuery

          return (
            <div key={group.id} className="rounded-xl border border-border bg-card/50 overflow-hidden">
              <div className={cn(
                "flex items-center justify-between p-3 transition-colors",
                selectedInGroup > 0 ? "bg-primary/5" : "bg-transparent"
              )}>
                <button
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  className="flex items-center gap-2 text-left hover:text-primary transition-colors flex-1"
                >
                  <group.icon className={cn("h-4 w-4", selectedInGroup > 0 ? "text-primary" : "text-muted-foreground")} />
                  <span className="font-semibold text-sm">{group.label}</span>
                  {selectedInGroup > 0 && (
                    <Badge variant="default" className="h-5 px-1.5 text-[10px] bg-primary text-primary-foreground">
                      {selectedInGroup}
                    </Badge>
                  )}
                  {expandedGroups.includes(group.id) ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
                
                {expandedGroups.includes(group.id) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleGroupSelection(group.id, group.technologies)
                    }}
                    className="h-7 px-2 text-[10px] font-bold uppercase tracking-tight text-muted-foreground hover:text-primary"
                  >
                    {allInCategorySelected ? 'Deselect All' : 'Select All'}
                  </Button>
                )}
              </div>

              <Collapsible
                open={expandedGroups.includes(group.id)}
                onOpenChange={() => {}} // Controlled by header click
              >
                <CollapsibleContent className="px-3 pb-3">
                  <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                    {visibleTechs.map((tech, index) => {
                      const isSelected = value.includes(tech.slug)
                      return (
                        <motion.button
                          key={tech.slug}
                          type="button"
                          onClick={() => toggleTech(tech.slug)}
                          initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.95 }}
                          animate={prefersReducedMotion ? false : { opacity: 1, scale: 1 }}
                          transition={{ delay: Math.min(index * 0.01, 0.1) }}
                          className={cn(
                            'flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all border',
                            isSelected 
                              ? 'bg-primary/10 border-primary/30 text-primary shadow-sm' 
                              : 'bg-muted/30 border-transparent hover:bg-muted/60 text-foreground/80'
                          )}
                        >
                          <div className={cn(
                            "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
                            isSelected ? "bg-primary border-primary" : "bg-background border-muted-foreground/30"
                          )}>
                            {isSelected && <Check className="h-2.5 w-2.5 text-primary-foreground" />}
                          </div>
                          <span className="text-xs font-medium truncate leading-none">{tech.name}</span>
                        </motion.button>
                      )
                    })}
                  </div>

                  {hasMore && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleShowAll(group.id)}
                      className="mt-2 w-full h-8 text-xs font-medium text-muted-foreground hover:text-primary bg-muted/20"
                    >
                      {showAllInGroup[group.id] 
                        ? 'Show Less' 
                        : `Show ${group.technologies.length - 9} more...`}
                    </Button>
                  )}
                </CollapsibleContent>
              </Collapsible>
            </div>
          )
        })}
      </div>

      {searchQuery && filteredGroups.length === 0 && (
        <div className="py-12 flex flex-col items-center justify-center text-center text-muted-foreground border border-dashed border-border rounded-xl bg-muted/5">
          <Search className="h-8 w-8 opacity-20 mb-3" />
          <p className="font-medium">No results found</p>
          <p className="text-xs opacity-60 mt-1">Try a different search term</p>
          <Button variant="link" size="sm" onClick={() => setSearchQuery('')} className="mt-2">
            Clear search
          </Button>
        </div>
      )}
    </div>
  )
}
