import React from 'react';
import { RouteComponentProps } from '@reach/router';
import { CorroboratingEventForm } from '../consumer/components/CorroboratingEventForm';

type Props = RouteComponentProps;

export const Consumer: React.FC<Props> = (props: any) => {
  return <>
    <CorroboratingEventForm/>
  </>;
};
