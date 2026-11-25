import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Bell, Check, Info, CheckCircle, AlertTriangle, XCircle, Sparkles } from "lucide-react";
import { useNotifications } from "@/contexts/NotificationsContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

export function NotificationsPopover() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-[#10B981]" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-[#D4AF37]" />;
      case 'error': return <XCircle className="h-4 w-4 text-destructive" />;
      default: return <Info className="h-4 w-4 text-[#064E3B] dark:text-emerald-400" />;
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="h-9 w-9 rounded-xl bg-card border border-border/80 flex items-center justify-center relative cursor-pointer hover:bg-[#D1FAE5]/40 transition-colors shadow-xs"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4 text-[#064E3B] dark:text-emerald-300" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-[#10B981] rounded-full ring-2 ring-card animate-pulse"></span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 mr-4 bg-card border border-border/80 shadow-2xl rounded-3xl overflow-hidden" align="end">
        <div className="flex items-center justify-between p-4 border-b border-border/60 bg-muted/30">
          <div className="flex items-center gap-1.5">
            <h4 className="font-bold font-display text-sm text-foreground leading-none">Notifications</h4>
            {unreadCount > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#D1FAE5] text-[#064E3B]">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto px-2 py-1 text-[11px] font-bold text-[#064E3B] dark:text-emerald-400 hover:bg-[#D1FAE5]/40 rounded-lg"
              onClick={markAllAsRead}
            >
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="h-[280px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12 px-4 text-muted-foreground text-xs text-center">
              <Bell className="h-8 w-8 mb-2 opacity-30 text-[#064E3B]" />
              <p className="font-medium">No alerts right now</p>
              <p className="text-[10px] mt-0.5">Order updates will appear here</p>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-border/50">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "flex gap-3 p-3.5 hover:bg-muted/40 transition-colors cursor-pointer relative",
                    !notification.read && "bg-[#D1FAE5]/20 dark:bg-emerald-950/20"
                  )}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="mt-0.5 shrink-0">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 space-y-0.5 min-w-0">
                    <p className={cn("text-xs font-medium leading-tight text-foreground truncate", !notification.read && "font-bold text-[#064E3B] dark:text-emerald-300")}>
                      {notification.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                      {notification.message}
                    </p>
                    <p className="text-[10px] text-muted-foreground/60 pt-0.5 font-medium">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-[#10B981]"></div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
