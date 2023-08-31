import * as React from 'react';
import {styled} from '@twilio-paste/core/styling-library';
import type {BoxStyleProps} from '@twilio-paste/core/box';
import {Box} from '@twilio-paste/core/box';
import {Anchor} from '@twilio-paste/core/anchor';
import {Button} from '@twilio-paste/core/button';
import {Heading} from '@twilio-paste/core/heading';
import {NewIcon} from '@twilio-paste/icons/esm/NewIcon';
import {HeatmapIcon} from '@twilio-paste/icons/esm/HeatmapIcon'
import {Spinner} from '@twilio-paste/core/spinner';
import { Label, Input, HelpText, Grid, Column, Text, Card, UnorderedList, ListItem, Table, THead, TBody, Tr, Td, Th } from '@twilio-paste/core';
import { Paragraph } from '@twilio-paste/core';

import { useRef, useState } from "react";



export const IndexPage = (): JSX.Element => {
  const [accountSid, setAccountSid] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [messageCount, setMessageCount] = useState(90);
  const [clusters, setClusters] = useState([
      { examples: ['Your Twilio verification code is 1234', 'Your Twitch verification code 4321'], summary: 'Sample OTP use case', length: 17, percent: 0.18888889 },
      { examples: ['Your app download link is click.autobuy.com/1234', 'Your app download link is click.autobuy.com/4567', 'Your app download link is click.autobuy.com/7890'], summary: 'Sample App download use case', length: 73, percent: 0.8111111 }
    ]);

  const [loadingState, setLoadingState] = useState(false);
  
  async function callBackend (event: any, accountSid: string, authToken: string) {
    event.preventDefault();
    setLoadingState(true);

    await fetch(`http://localhost:8000/cluster/${accountSid}/${authToken}`, {
      method: "GET", // *GET, POST, PUT, DELETE, etc.
      mode: "no-cors", // no-cors, *cors, same-origin
      cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
      headers: {
        "Content-Type": "application/json",
      },
      redirect: "follow", // manual, *follow, error
      referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setLoadingState(false);
        setClusters(data['clusters']);
        setMessageCount(data.message_count)
      })

    //setResponse(response);
  }

  let loadingSpinner;

  if (loadingState === false) {
    loadingSpinner = <div></div>
  } else {
    loadingSpinner = (
      <Box margin="space100">
        <Spinner decorative={false} title="Loading" size="sizeIcon80" />
      </Box>
      )
  }

  return (
    <Grid gutter="space30">
      <Column span={4}>
        <Box
          margin="space100"
          padding="space60"
          borderRadius="borderRadius20"
          borderStyle="solid"
          borderWidth="borderWidth10"
          borderColor="colorBorder">
          <Heading as="h1" variant="heading10">
            Account Information
          </Heading>
          <Paragraph>
            Quickly understand messaging use cases in your Twilio account.
          </Paragraph>
          <Box
            marginTop="space60"
            marginBottom="space60"
          >
            <Label htmlFor="email_address" required>Account SID</Label>
            <Input onChange={(e) => { setAccountSid(e.target.value)}} aria-describedby="email_help_text" id="email_address" name="email_address" type="text" placeholder="ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" required/>
            <HelpText id="email_help_text">
              Find your account SID in the <Anchor href="https://twilio.com/console">Twilio Console</Anchor>.
            </HelpText>
            <Label htmlFor="email_address" required>Auth Token</Label>
            <Input onChange={(e) => { setAuthToken(e.target.value)}} aria-describedby="email_help_text" id="email_address" name="email_address" type="password" placeholder="••••••••••••••••••••••••••••••" required/>
            <HelpText id="email_help_text">Enter your auth token here.</HelpText>
          </Box>
          <Box
            backgroundColor="colorBackgroundWarningWeakest"
            display="inline-block"
            padding="space40"
            marginBottom="space60"
          >
            Warning: All message data in your account will be shared with OpenAI and may be stored for an indeterminate amount of time. Use only with a personal demo account.
          </Box>
          <Button variant="primary" onClick={(event) => callBackend(event, accountSid, authToken)}>
            <NewIcon decorative />
            Analyze Use Cases
          </Button>
        </Box>
      </Column>

      <Column span={8}>
        <Box
          margin="space100"
        >
          <Heading as="h1" variant="heading10">
            Twilio Messaging Intelligence ✨
          </Heading>
          <Heading as="h2" variant="heading30">{messageCount} messages analyzed for use cases.</Heading>

          { loadingSpinner }

          <Table>
            <THead>
              <Tr>
                <Th>Use Case</Th>
                <Th>Frequency</Th>
                <Th>Sample Messages</Th>
              </Tr>
            </THead>
            <TBody>
              {clusters.map(function(cluster:any, i){
                  return (
                    <Tr key={i}>
                      <Th scope='row'>{cluster.summary}</Th>
                      <Td>{Math.round(cluster.percent * 100)}% ({cluster.length})</Td>
                      <Td>Examples:
                      <UnorderedList>
                        {cluster.examples.map((example: string, j:number) => {
                          return <ListItem key={j}>{example}</ListItem>
                        })}
                      </UnorderedList>
                      </Td>
                    </Tr>
                  );
              })}
            </TBody>
          </Table>
        </Box>
      </Column>
    </Grid>
  );
};

IndexPage.displayName = 'IndexPage';
