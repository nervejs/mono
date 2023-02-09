import * as React from 'react';

export function getComponentDisplayName(WrappedComponent: React.ComponentType): string {
	return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}
