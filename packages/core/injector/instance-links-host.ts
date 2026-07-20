import { InjectionToken } from '@nestjs/common';
import { isFunction } from '@nestjs/common/utils/shared.utils';
import { UnknownElementException } from '../errors/exceptions/unknown-element.exception';
import { NestContainer } from './container';
import { InstanceWrapper } from './instance-wrapper';
import { Module } from './module';

type HostCollection = 'providers' | 'controllers' | 'injectables';

export interface InstanceLink<T = any> {
  token: InjectionToken;
  wrapperRef: InstanceWrapper<T>;
  collection: Map<any, InstanceWrapper>;
  moduleId: string;
}

export class InstanceLinksHost {
  private readonly instanceLinks = new Map<InjectionToken, InstanceLink[]>();

  constructor(private readonly container: NestContainer) {
      throw new Error("STUB");
  }

  get<T = any>(token: InjectionToken): InstanceLink<T>;
  get<T = any>(
    token: InjectionToken,
    options?: { moduleId?: string; each?: boolean },
  ): InstanceLink<T> | Array<InstanceLink<T>>;
  get<T = any>(
    token: InjectionToken,
    options: { moduleId?: string; each?: boolean } = {},
  ): InstanceLink<T> | Array<InstanceLink<T>> {
    const instanceLinksForGivenToken = this.instanceLinks.get(token);

    if (!instanceLinksForGivenToken) {
      throw new UnknownElementException(this.getInstanceNameByToken(token));
    }

    if (options.each) {
      return instanceLinksForGivenToken;
    }

    const instanceLink = options.moduleId
      ? instanceLinksForGivenToken.find(
          item => { throw new Error("STUB"); },
        )
      : instanceLinksForGivenToken[instanceLinksForGivenToken.length - 1];

    if (!instanceLink) {
      throw new UnknownElementException(this.getInstanceNameByToken(token));
    }
    return instanceLink;
  }

  private initialize() {
    const modules = this.container.getModules();
    modules.forEach(moduleRef => {
        throw new Error("STUB");
    });
  }

  private addLink(
    wrapper: InstanceWrapper,
    token: InjectionToken,
    moduleRef: Module,
    collectionName: HostCollection,
  ) {
    const instanceLink: InstanceLink = {
      moduleId: moduleRef.id,
      wrapperRef: wrapper,
      collection: moduleRef[collectionName],
      token,
    };
    const existingLinks = this.instanceLinks.get(token);
    if (!existingLinks) {
      this.instanceLinks.set(token, [instanceLink]);
    } else {
      existingLinks.push(instanceLink);
    }
  }

  private getInstanceNameByToken(token: InjectionToken): string {
    return isFunction(token) ? (token as Function)?.name : (token as string);
  }
}
