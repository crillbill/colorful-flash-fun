import { Button } from "@/components/ui/button";
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Menu, MoveRight, Search, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import SearchMicrophone from "@/components/SearchMicrophone";

interface Header1Props {
    children?: React.ReactNode;
    className?: string;
}

interface HebrewWord {
    hebrew: string;
    english: string;
    transliteration: string | null;
}

function Header1({ children, className }: Header1Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearchActive, setIsSearchActive] = useState(false);

    const { data: searchResults, isLoading } = useQuery({
        queryKey: ['headerSearch', searchTerm],
        queryFn: async () => {
            if (!searchTerm) return [];
            
            const trimmedSearch = searchTerm.trim().toLowerCase();
            if (!trimmedSearch) return [];

            const { data: exactMatches, error: exactError } = await supabase
                .from('hebrew_bulk_words')
                .select('hebrew, english, transliteration')
                .ilike('english', trimmedSearch)
                .order('word_number', { ascending: true })
                .limit(5);

            if (exactError) {
                console.error('Error fetching exact matches:', exactError);
                throw exactError;
            }

            return exactMatches || [];
        },
        enabled: searchTerm.length > 0
    });

    const handleVoiceResult = (text: string) => {
        if (text) {
            setSearchTerm(text);
            setIsSearchActive(true);
        }
    };

    const navigationItems = [
        {
            title: "Home",
            href: "/",
            description: "",
        },
        {
            title: "Product",
            description: "Managing a small business today is already tough.",
            items: [
                {
                    title: "Reports",
                    href: "/reports",
                },
                {
                    title: "Statistics",
                    href: "/statistics",
                },
                {
                    title: "Dashboards",
                    href: "/dashboards",
                },
                {
                    title: "Recordings",
                    href: "/recordings",
                },
            ],
        },
        {
            title: "Company",
            description: "Managing a small business today is already tough.",
            items: [
                {
                    title: "About us",
                    href: "/about",
                },
                {
                    title: "Fundraising",
                    href: "/fundraising",
                },
                {
                    title: "Investors",
                    href: "/investors",
                },
                {
                    title: "Contact us",
                    href: "/contact",
                },
            ],
        },
    ];

    const [isOpen, setOpen] = useState(false);

    return (
        <header className={`w-full z-40 fixed top-0 left-0 bg-background ${className || ''}`}>
            <div className="container relative mx-auto min-h-20 flex items-center justify-between">
                <div className="flex-1 lg:flex hidden">
                    <NavigationMenu>
                        <NavigationMenuList className="flex gap-4">
                            {navigationItems.map((item) => (
                                <NavigationMenuItem key={item.title}>
                                    {item.href ? (
                                        <NavigationMenuLink asChild>
                                            <Link to={item.href}>
                                                <Button variant="ghost">{item.title}</Button>
                                            </Link>
                                        </NavigationMenuLink>
                                    ) : (
                                        <>
                                            <NavigationMenuTrigger>{item.title}</NavigationMenuTrigger>
                                            <NavigationMenuContent>
                                                <div className="flex flex-col lg:grid grid-cols-2 gap-4">
                                                    <div className="flex flex-col h-full justify-between">
                                                        <div className="flex flex-col">
                                                            <p className="text-base">{item.title}</p>
                                                            <p className="text-muted-foreground text-sm">
                                                                {item.description}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col text-sm h-full justify-end">
                                                        {item.items?.map((subItem) => (
                                                            <Link
                                                                to={subItem.href}
                                                                key={subItem.title}
                                                                className="flex flex-row justify-between items-center hover:bg-muted py-2 px-4 rounded"
                                                            >
                                                                <span>{subItem.title}</span>
                                                                <MoveRight className="w-4 h-4 text-muted-foreground" />
                                                            </Link>
                                                        ))}
                                                    </div>
                                                </div>
                                            </NavigationMenuContent>
                                        </>
                                    )}
                                </NavigationMenuItem>
                            ))}
                        </NavigationMenuList>
                    </NavigationMenu>
                </div>

                <div className="flex-1 max-w-xl mx-auto px-4">
                    <div className="relative">
                        <div className="relative flex items-center">
                            <Search className="absolute left-3 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                className="w-full pl-10 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="Search Hebrew dictionary..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setIsSearchActive(true);
                                }}
                                onFocus={() => setIsSearchActive(true)}
                            />
                            <div className="absolute right-2 flex items-center gap-2">
                                <SearchMicrophone onTranscription={handleVoiceResult} />
                                {searchTerm && (
                                    <button
                                        onClick={() => {
                                            setSearchTerm('');
                                            setIsSearchActive(false);
                                        }}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                        {isSearchActive && searchTerm && (
                            <div className="absolute w-full mt-1 bg-white rounded-lg shadow-lg border z-50">
                                {isLoading ? (
                                    <div className="p-4 text-center text-gray-500">
                                        Searching...
                                    </div>
                                ) : searchResults && searchResults.length > 0 ? (
                                    <div className="divide-y">
                                        {searchResults.map((result, index) => (
                                            <div key={index} className="p-3 hover:bg-gray-50">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-700">{result.english}</span>
                                                    <span className="text-lg font-bold text-gray-800" dir="rtl">
                                                        {result.hebrew}
                                                    </span>
                                                </div>
                                                {result.transliteration && (
                                                    <div className="text-sm text-gray-500 mt-1">
                                                        {result.transliteration}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        <Link
                                            to="/dictionary"
                                            className="block p-3 text-center text-purple-600 hover:bg-gray-50"
                                        >
                                            View all results
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="p-4 text-center text-gray-500">
                                        No results found
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex-1 flex justify-end">
                    <Button>Get started</Button>
                </div>

                <div className="lg:hidden">
                    <Button variant="ghost" onClick={() => setOpen(!isOpen)}>
                        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </Button>
                    {isOpen && (
                        <div className="absolute top-20 border-t flex flex-col w-full right-0 bg-background shadow-lg py-4 container gap-8">
                            {navigationItems.map((item) => (
                                <div key={item.title}>
                                    <div className="flex flex-col gap-2">
                                        {item.href ? (
                                            <Link
                                                to={item.href}
                                                className="flex justify-between items-center"
                                            >
                                                <span className="text-lg">{item.title}</span>
                                                <MoveRight className="w-4 h-4 stroke-1 text-muted-foreground" />
                                            </Link>
                                        ) : (
                                            <p className="text-lg">{item.title}</p>
                                        )}
                                        {item.items &&
                                            item.items.map((subItem) => (
                                                <Link
                                                    key={subItem.title}
                                                    to={subItem.href}
                                                    className="flex justify-between items-center"
                                                >
                                                    <span className="text-muted-foreground">
                                                        {subItem.title}
                                                    </span>
                                                    <MoveRight className="w-4 h-4 stroke-1" />
                                                </Link>
                                            ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            {children}
        </header>
    );
}

export { Header1 };
