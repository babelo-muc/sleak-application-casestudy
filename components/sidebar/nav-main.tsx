import Link from 'next/link'
import { HomeIcon, MessageSquare, Trash2 } from 'lucide-react'
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar'

export function NavMain() {
    const items = [
        {
            title: 'Home',
            url: '/',
            icon: HomeIcon,
        },
        {
            title: 'Conversations',
            url: '/conversations',
            icon: MessageSquare,
        },
        {
            title: 'Deleted',
            url: '/deleted',
            icon: Trash2,
        },
    ]

    return (
        <SidebarGroup>
            <SidebarGroupContent className="flex flex-col gap-2">
                {/* <SidebarMenu>
                    <SidebarMenuItem className="flex items-center gap-2">
                        <SidebarMenuButton
                            tooltip="Quick Create"
                            className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
                        >
                            <CirclePlus />
                            <span>Quick Create</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu> */}
                <SidebarMenu>
                    {items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton tooltip={item.title} asChild={item.url !== '#'}>
                                <Link href={item.url}>
                                    {item.icon && <item.icon />}
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    )
}
