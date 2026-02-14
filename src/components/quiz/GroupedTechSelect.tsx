'use client'

// src/components/quiz/GroupedTechSelect.tsx
// Grouped multi-select for Q2: Current Skills

import React, { useState, useMemo } from 'react'
import { Code2, Layout, Server, Smartphone, Cloud, Database, LucideIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'

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
    label: 'Programming Languages',
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
    id: 'frontend',
    label: 'Frontend Frameworks & Libraries',
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
    id: 'backend',
    label: 'Backend & APIs',
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
    id: 'mobile',
    label: 'Mobile Development',
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
    id: 'cloud',
    label: 'Cloud & DevOps',
    icon: Cloud,
    defaultExpanded: false,
    technologies: [
      { slug: 'aws', name: 'AWS', popularity: 82 },
      { slug: 'azure', name: 'Azure', popularity: 68 },
      { slug: 'gcp', name: 'Google Cloud', popularity: 58 },
      { slug: 'docker', name: 'Docker', popularity: 76 },
      { slug: 'kubernetes', name: 'Kubernetes', popularity: 65 },
      { slug: 'git', name: 'Git', popularity: 95 },
      { slug: 'ci-cd', name: 'CI/CD', popularity: 70 },
      { slug: 'terraform', name: 'Terraform', popularity: 55 },
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

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search input */}
      <div className="space-y-2">
        <Input
          type="search"
          placeholder="Search for a technology..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />
        {selectedCount > 0 && (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{selectedCount} selected</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onChange([])}
            >
              Clear all
            </Button>
          </div>
        )}
      </div>

      {/* Technology groups */}
      <div className="space-y-3">
        {filteredGroups.map(group => {
          const selectedInGroup = group.technologies.filter(t =>
            value.includes(t.slug)
          ).length
          const visibleTechs = showAllInGroup[group.id]
            ? group.technologies
            : group.technologies.slice(0, 10)
          const hasMore = group.technologies.length > 10

          return (
            <Collapsible
              key={group.id}
              open={expandedGroups.includes(group.id)}
              onOpenChange={() => toggleGroup(group.id)}
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex w-full items-center justify-between p-3 hover:bg-muted"
                >
                  <div className="flex items-center gap-2">
                    <group.icon className="h-4 w-4" />
                    <span className="font-medium">{group.label}</span>
                    {selectedInGroup > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {selectedInGroup} selected
                      </Badge>
                    )}
                  </div>
                  <span className="text-muted-foreground">
                    {expandedGroups.includes(group.id) ? '−' : '+'}
                  </span>
                </Button>
              </CollapsibleTrigger>

              <CollapsibleContent className="mt-2 space-y-2 px-3">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {visibleTechs.map(tech => (
                    <Button
                      key={tech.slug}
                      variant={value.includes(tech.slug) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleTech(tech.slug)}
                      className="justify-start"
                    >
                      {tech.name}
                    </Button>
                  ))}
                </div>

                {hasMore && !showAllInGroup[group.id] && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleShowAll(group.id)
                    }}
                    className="w-full"
                  >
                    Show {group.technologies.length - 10} more...
                  </Button>
                )}
              </CollapsibleContent>
            </Collapsible>
          )
        })}
      </div>

      {searchQuery && filteredGroups.length === 0 && (
        <div className="py-8 text-center text-sm text-muted-foreground">
          No technologies found matching "{searchQuery}"
        </div>
      )}
    </div>
  )
}
