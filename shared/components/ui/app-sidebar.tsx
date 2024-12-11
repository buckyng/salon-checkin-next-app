import { SignOutButton } from '@shared/components/ui/signout-button';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@shared/components/ui/sidebar';

export interface SidebarItem {
  title: string;
  url: string;
  icon: React.ComponentType; // Icon component type
}

export interface AppSidebarProps {
  items: SidebarItem[]; // Array of navigation items
}

export function AppSidebar({ items }: AppSidebarProps) {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {/* Signout Button */}
              <div className="w-full p-4 mt-auto">
                <SignOutButton />
              </div>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
