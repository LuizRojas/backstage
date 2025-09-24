// packages/app/src/components/home/HomePage.tsx

import { useEffect, useState } from 'react'; // 'React' removido
import {
  Header,
  Page,
  Content,
  InfoCard,
  Progress,
  ErrorPanel,
  Table,
} from '@backstage/core-components';
import {
  Grid,
  List,
  ListItem,
  ListItemText,
  Typography,
  Avatar,
  Link as MuiLink,
} from '@material-ui/core';
import { useApi } from '@backstage/core-plugin-api';
import {
  catalogApiRef,
  humanizeEntityRef,
  MissingAnnotationEmptyState,
} from '@backstage/plugin-catalog-react';
import { identityApiRef } from '@backstage/core-plugin-api';
import { UserEntity, GroupEntity, Entity } from '@backstage/catalog-model';
import { Link } from 'react-router-dom';

// CORREÇÃO: Usando a string da anotação diretamente para evitar problemas de importação.
const GITHUB_PROJECT_SLUG_ANNOTATION = 'github.com/orgs/leds-conectafapes/projects/27';

// Componente para exibir issues de um repositório específico
const TeamGitHubIssues = ({ project }: { project: Entity }) => {
  const projectSlug =
    project.metadata.annotations?.[GITHUB_PROJECT_SLUG_ANNOTATION];

  if (!projectSlug) {
    return (
      <Typography variant="body2" style={{ paddingLeft: '16px' }}>
        O projeto {project.metadata.name} não possui a anotação
        'github.com/project-slug'.
      </Typography>
    );
  }

  return (
    <ListItem>
      <ListItemText
        primary={`Issues do Projeto: ${project.metadata.name}`}
        secondary={
          <MuiLink
            href={`https://github.com/${projectSlug}/issues`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Ver issues no GitHub
          </MuiLink>
        }
      />
    </ListItem>
  );
};

export const HomePage = () => {
  const catalogApi = useApi(catalogApiRef);
  const identityApi = useApi(identityApiRef);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error>();
  const [user, setUser] = useState<UserEntity>();
  const [team, setTeam] = useState<GroupEntity>();
  const [teamMembers, setTeamMembers] = useState<UserEntity[]>([]);
  const [ownedComponents, setOwnedComponents] = useState<Entity[]>([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { userEntityRef } = await identityApi.getBackstageIdentity();
        const userEntity = (await catalogApi.getEntityByRef(
          userEntityRef,
        )) as UserEntity;
        setUser(userEntity);

        if (!userEntity.spec.memberOf || userEntity.spec.memberOf.length === 0) {
          throw new Error('Você não faz parte de nenhum time no catálogo.');
        }
        const teamRef = userEntity.spec.memberOf[0];
        const teamEntity = (await catalogApi.getEntityByRef(
          teamRef,
        )) as GroupEntity;
        setTeam(teamEntity);

        const membersResponse = await catalogApi.getEntities({
          filter: {
            kind: 'User',
            'spec.memberOf': teamRef,
          },
        });
        setTeamMembers(membersResponse.items as UserEntity[]);

        const componentsResponse = await catalogApi.getEntities({
          filter: {
            kind: 'Component',
            'spec.owner': teamRef,
          },
        });
        setOwnedComponents(componentsResponse.items);
      } catch (e: any) {
        setError(e);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [catalogApi, identityApi]);

  if (loading) {
    return <Progress />;
  }

  if (error) {
    return <ErrorPanel error={error} />;
  }

  if (!user || !team) {
    return (
      <ErrorPanel
        error={{
          name: 'Error',
          message:
            'Não foi possível carregar as informações do usuário ou do time.',
        }}
      />
    );
  }

  const membersTableData = teamMembers.map(member => ({
    name:
      member.spec.profile?.displayName ??
      humanizeEntityRef(member, { defaultKind: 'User' }),
    title: member.spec.profile?.email,
    picture: member.spec.profile?.picture,
  }));

  const columns = [
    {
      title: 'Avatar',
      field: 'picture',
      render: (rowData: { picture?: string; name:string }) => (
        <Avatar src={rowData.picture} alt={rowData.name} />
      ),
    },
    { title: 'Nome', field: 'name' },
    { title: 'Contato', field: 'title' },
  ];

  return (
    <Page themeId="home">
      <Header
        title={`Olá, ${user.spec.profile?.displayName ?? user.metadata.name}!`}
        subtitle={`Você faz parte do time ${
          team.spec.profile?.displayName ?? team.metadata.name
        }`}
      />
      <Content>
        <Grid container spacing={3} direction="row">
          <Grid item xs={12} md={6}>
            <InfoCard title="Membros da Equipe">
              <Table
                options={{ paging: false, search: false, toolbar: false }}
                columns={columns}
                data={membersTableData}
              />
            </InfoCard>
          </Grid>

          <Grid item xs={12} md={6}>
            <InfoCard title="Ferramentas e Projetos do Time">
              <List>
                {ownedComponents.length > 0 ? (
                  ownedComponents.map(component => (
                    <ListItem key={component.metadata.uid}>
                      <ListItemText
                        primary={
                          <Link
                            to={`/catalog/default/component/${component.metadata.name}`}
                          >
                            {component.metadata.title ?? component.metadata.name}
                          </Link>
                        }
                        secondary={component.metadata.description}
                      />
                    </ListItem>
                  ))
                ) : (
                  <Typography variant="body2">
                    Nenhum projeto encontrado para este time.
                  </Typography>
                )}
              </List>
            </InfoCard>
          </Grid>

          <Grid item xs={12}>
            <InfoCard title="Issues e Tasks Abertas">
              {ownedComponents.length > 0 ? (
                <List>
                  {ownedComponents.map(proj => (
                    <TeamGitHubIssues key={proj.metadata.uid} project={proj} />
                  ))}
                </List>
              ) : (
                <MissingAnnotationEmptyState
                  annotation={GITHUB_PROJECT_SLUG_ANNOTATION}
                />
              )}
            </InfoCard>
          </Grid>
        </Grid>
      </Content>
    </Page>
  );
};