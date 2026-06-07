import { useState, useEffect, useMemo, memo, useRef, useCallback } from 'react';
import {
  Heart,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Star,
  X,
} from 'lucide-react';
import { useIsMobile } from './ui/use-mobile';
import { canAccessModule } from '../utils/permissions';
import { NAV_SECTIONS, type NavItem, type NavSection } from '../config/navigation';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userPermissions?: string[];
  currentUser?: any;
  mobileOpen?: boolean;
  onMobileOpenChange?: (open: boolean) => void;
}

function itemIsVisible(item: NavItem, currentUser: any): boolean {
  if (item.id === 'prueba' && import.meta.env.PROD) return false;
  if (item.children?.length) {
    return item.children.some((child) => itemIsVisible(child, currentUser));
  }
  if (!item.id) return false;
  if (!currentUser) return item.id !== 'prueba' || import.meta.env.DEV;
  return canAccessModule(currentUser, item.id);
}

function sectionIsVisible(section: NavSection, currentUser: any): boolean {
  return section.items.some((item) => itemIsVisible(item, currentUser));
}

function collectAncestorGroups(activeTab: string): string[] {
  const groups: string[] = [];
  const walk = (items: NavItem[], path: string): boolean => {
    let found = false;
    for (const item of items) {
      const key = `${path}/${item.label}`;
      if (item.id === activeTab) found = true;
      if (item.children?.length) {
        const childFound = walk(item.children, key);
        if (childFound) {
          groups.push(key);
          found = true;
        }
      }
    }
    return found;
  };
  for (const section of NAV_SECTIONS) walk(section.items, section.id);
  return groups;
}

export function Sidebar({
  activeTab,
  setActiveTab,
  userPermissions,
  currentUser,
  mobileOpen,
  onMobileOpenChange,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isMobile = useIsMobile();

  const [expandedSections, setExpandedSections] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    NAV_SECTIONS.forEach((s) => {
      if (s.defaultOpen) initial.add(s.id);
    });
    return initial;
  });

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    const groups = collectAncestorGroups(activeTab);
    if (groups.length === 0) return;
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      groups.forEach((g) => next.add(g));
      return next;
    });
    const section = NAV_SECTIONS.find((s) =>
      s.items.some((item) => item.id === activeTab || item.children?.some((c) => c.id === activeTab))
    );
    if (section) {
      setExpandedSections((prev) => new Set(prev).add(section.id));
    }
  }, [activeTab]);

  const handleItemClick = (tab: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
      e.nativeEvent.stopImmediatePropagation();
    }
    setActiveTab(tab);
    if (isMobile && onMobileOpenChange) onMobileOpenChange(false);
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  };

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupKey)) next.delete(groupKey);
      else next.add(groupKey);
      return next;
    });
  };

  const visibleSections = useMemo(
    () => NAV_SECTIONS.filter((s) => sectionIsVisible(s, currentUser)),
    [currentUser, userPermissions]
  );

  const SidebarContent = memo(
    ({
      forceExpanded = false,
      currentActiveTab,
      onItemClick,
      sectionsList,
      collapsed,
      expandedSectionsSet,
      expandedGroupsSet,
      onToggleSection,
      onToggleGroup,
      user,
    }: {
      forceExpanded?: boolean;
      currentActiveTab: string;
      onItemClick: (tab: string, e?: React.MouseEvent) => void;
      sectionsList: NavSection[];
      collapsed: boolean;
      expandedSectionsSet: Set<string>;
      expandedGroupsSet: Set<string>;
      onToggleSection: (id: string) => void;
      onToggleGroup: (key: string) => void;
      user: any;
    }) => {
      const showExpanded = forceExpanded || !collapsed;
      const sidebarScrollRef = useRef<HTMLDivElement>(null);

      useEffect(() => {
        const el = sidebarScrollRef.current;
        if (!el) return;
        const saved = sessionStorage.getItem('sidebarScrollPosition');
        if (saved) {
          const v = parseInt(saved, 10);
          if (v >= 0) {
            requestAnimationFrame(() => { el.scrollTop = v; });
            setTimeout(() => { el.scrollTop = v; }, 10);
          }
        }
      }, [currentActiveTab]);

      useEffect(() => {
        const el = sidebarScrollRef.current;
        if (!el) return;
        const onScroll = () => sessionStorage.setItem('sidebarScrollPosition', String(el.scrollTop));
        el.addEventListener('scroll', onScroll, { passive: true });
        return () => el.removeEventListener('scroll', onScroll);
      }, []);

      const renderNavItem = useCallback(
        (item: NavItem, depth = 0, groupKey = '') => {
          if (!itemIsVisible(item, user)) return null;

          const Icon = item.icon;
          const hasChildren = Boolean(item.children?.length);
          const fullGroupKey = groupKey ? `${groupKey}/${item.label}` : item.label;
          const isGroupExpanded = expandedGroupsSet.has(fullGroupKey);
          const childActive = item.children?.some((c) => c.id === currentActiveTab) ?? false;
          const isActive = item.id === currentActiveTab || childActive;

          if (hasChildren) {
            return (
              <div key={fullGroupKey} className="space-y-0.5">
                <button
                  type="button"
                  onClick={() => onToggleGroup(fullGroupKey)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all duration-200 group ${
                    showExpanded ? 'rounded-xl' : 'rounded-xl justify-center px-2'
                  } ${
                    isActive
                      ? 'border border-cyan-400/40 bg-slate-800/60 text-white'
                      : 'border border-transparent text-slate-400 hover:text-white hover:bg-white/[0.06]'
                  }`}
                  title={!showExpanded ? item.label : undefined}
                >
                  <Icon className={`h-[1.15rem] w-[1.15rem] shrink-0 ${item.color ?? 'text-slate-400'}`} strokeWidth={1.5} />
                  {showExpanded && (
                    <>
                      <span className="font-medium text-sm truncate flex-1">{item.label}</span>
                      {item.badge && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md border bg-slate-800/80 text-slate-200 border-slate-600/60">
                          {item.badge}
                        </span>
                      )}
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 transition-transform ${isGroupExpanded ? 'rotate-180' : ''}`}
                      />
                    </>
                  )}
                </button>
                {showExpanded && isGroupExpanded && (
                  <div className="ml-3 pl-2 border-l border-slate-700/80 space-y-0.5">
                    {item.children!.map((child) => renderNavItem(child, depth + 1, fullGroupKey))}
                  </div>
                )}
              </div>
            );
          }

          if (!item.id) return null;

          return (
            <button
              key={item.id}
              type="button"
              onClick={(e) => onItemClick(item.id!, e)}
              className={`w-full flex items-center gap-3 py-2.5 text-left transition-all duration-200 group ${
                showExpanded ? `rounded-xl px-3 ${depth > 0 ? 'py-2' : ''}` : 'rounded-xl justify-center px-2'
              } ${
                currentActiveTab === item.id
                  ? 'border border-cyan-400/55 bg-slate-800/75 text-white shadow-[0_0_18px_-4px_rgba(34,211,238,0.45),inset_0_1px_0_rgba(255,255,255,0.06)] ring-1 ring-cyan-400/20'
                  : 'border border-transparent text-slate-400 hover:text-white hover:bg-white/[0.06]'
              }`}
              title={!showExpanded ? item.label : undefined}
            >
              <Icon
                className={`h-[1.15rem] w-[1.15rem] shrink-0 transition-opacity ${item.color ?? 'text-slate-400'} ${
                  currentActiveTab === item.id ? 'opacity-100' : 'opacity-85 group-hover:opacity-100'
                }`}
                strokeWidth={1.5}
              />
              {showExpanded && (
                <>
                  <span className={`font-medium text-sm truncate flex-1 min-w-0 ${currentActiveTab === item.id ? 'text-white' : ''}`}>
                    {item.label}
                  </span>
                  <div className="flex items-center gap-2 shrink-0 ml-auto">
                    {item.badge && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md border bg-slate-800/80 text-slate-200 border-slate-600/60">
                        {item.badge}
                      </span>
                    )}
                    {currentActiveTab === item.id && (
                      <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_12px_2px_rgba(34,211,238,0.85)]" aria-hidden />
                    )}
                  </div>
                </>
              )}
            </button>
          );
        },
        [user, currentActiveTab, showExpanded, expandedGroupsSet, onItemClick, onToggleGroup]
      );

      return (
        <div
          ref={sidebarScrollRef}
          className="p-4 h-full w-full flex flex-col overflow-y-auto sidebar-scroll-on-hover relative"
        >
          <div className="mb-8 mt-2 flex items-center space-x-3 px-2">
            <div className="w-9 h-9 bg-gradient-to-tr from-cyan-500 to-indigo-600 rounded-xl shadow-lg shadow-cyan-500/30 flex items-center justify-center ring-2 ring-cyan-400/25">
              <Heart className="h-5 w-5 text-white fill-white" />
            </div>
            {showExpanded && (
              <div>
                <h1 className="text-lg font-bold text-white tracking-tight leading-none">PetFlow</h1>
                <p className="text-[10px] font-semibold text-cyan-400/90 uppercase tracking-wider mt-0.5">Pro Dashboard</p>
              </div>
            )}
          </div>

          <nav className="space-y-4 flex-1">
            {sectionsList.map((section) => {
              const sectionOpen = expandedSectionsSet.has(section.id);
              const sectionHasActive = section.items.some(
                (item) =>
                  item.id === currentActiveTab ||
                  item.children?.some((c) => c.id === currentActiveTab)
              );

              return (
                <div key={section.id}>
                  {showExpanded ? (
                    <button
                      type="button"
                      onClick={() => onToggleSection(section.id)}
                      className={`w-full flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] mb-2 px-3 py-1 rounded-lg transition-colors ${
                        section.highlight ? 'text-cyan-400/80 hover:bg-white/5' : 'text-slate-500 hover:bg-white/5'
                      }`}
                    >
                      <span>{section.label}</span>
                      <ChevronDown className={`h-3 w-3 transition-transform ${sectionOpen ? 'rotate-180' : ''}`} />
                    </button>
                  ) : (
                    <div className="h-px bg-slate-700/50 my-2 mx-2" />
                  )}

                  {(sectionOpen || !showExpanded) && (
                    <div className="space-y-1">
                      {section.items.map((item) => renderNavItem(item, 0, section.id))}
                    </div>
                  )}

                  {showExpanded && sectionHasActive && !sectionOpen && (
                    <div className="space-y-1 mt-1">
                      {section.items
                        .filter(
                          (item) =>
                            item.id === currentActiveTab ||
                            item.children?.some((c) => c.id === currentActiveTab)
                        )
                        .map((item) => renderNavItem(item, 0, section.id))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {showExpanded && (
            <div className="mt-auto pt-6">
              <div className="rounded-xl p-3 border border-cyan-500/25 bg-slate-900/60 shadow-[0_0_20px_-8px_rgba(34,211,238,0.35)]">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center ring-1 ring-white/10">
                    <Star className="h-4 w-4 text-white fill-white" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-white">PetFlow Pro</p>
                    <p className="text-[10px] text-slate-400">v2.2</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    },
    (prev, next) =>
      prev.forceExpanded === next.forceExpanded &&
      prev.currentActiveTab === next.currentActiveTab &&
      prev.sectionsList === next.sectionsList &&
      prev.collapsed === next.collapsed &&
      prev.expandedSectionsSet === next.expandedSectionsSet &&
      prev.expandedGroupsSet === next.expandedGroupsSet
  );

  return (
    <>
      {isMobile && (
        <>
          <div
            className={`fixed inset-0 bg-black/50 z-[95] transition-opacity ${
              mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
            onClick={() => onMobileOpenChange?.(false)}
            aria-hidden={!mobileOpen}
          />
          <aside
            className={`fixed inset-y-0 left-0 w-[280px] sm:w-[320px] bg-[#0f172a] border-r border-slate-800/90 z-[100] transform transition-transform duration-300 ease-in-out shadow-xl shadow-black/40 ${
              mobileOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
            style={{ visibility: mobileOpen ? 'visible' : 'hidden', pointerEvents: mobileOpen ? 'auto' : 'none' }}
            aria-hidden={!mobileOpen}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => onMobileOpenChange?.(false)}
              className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 z-10"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent
              forceExpanded
              currentActiveTab={activeTab}
              onItemClick={handleItemClick}
              sectionsList={visibleSections}
              collapsed={isCollapsed}
              expandedSectionsSet={expandedSections}
              expandedGroupsSet={expandedGroups}
              onToggleSection={toggleSection}
              onToggleGroup={toggleGroup}
              user={currentUser}
            />
          </aside>
        </>
      )}

      <aside
        className={`${isCollapsed ? 'w-20' : 'w-64'} hidden md:flex bg-[#0f172a] border-r border-slate-800/90 transition-all duration-300 relative h-screen flex-col shadow-lg shadow-black/30 z-50`}
      >
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Expandir menú' : 'Contraer menú'}
          className="absolute right-2 top-6 z-10 flex h-10 w-10 items-center justify-center rounded-full text-slate-400 hover:bg-white/10 hover:text-white"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
        <SidebarContent
          forceExpanded={false}
          currentActiveTab={activeTab}
          onItemClick={handleItemClick}
          sectionsList={visibleSections}
          collapsed={isCollapsed}
          expandedSectionsSet={expandedSections}
          expandedGroupsSet={expandedGroups}
          onToggleSection={toggleSection}
          onToggleGroup={toggleGroup}
          user={currentUser}
        />
      </aside>
    </>
  );
}
